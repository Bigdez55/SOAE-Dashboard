/**
 * Data Service Layer
 *
 * This module provides an abstraction for data fetching.
 * CSV upload is the primary source for now; SharePoint/API can be added later.
 */

import { parseCsvText, csvRowsToObjects } from '../utils/csv.js';

// Configuration for data sources
const DATA_CONFIG = {
  // Set to 'api' for external endpoint or 'sharepoint' for future use
  mode: 'csv',
  apiUrl: '/api/dashboard',
  sharepoint: {
    siteUrl: '',
    listName: 'DashboardData'
  }
};

const DEFAULT_CONFIG = {
  onTimeHours: 24,
  ldBase: 5000,
  ldPerDay: 100,
  redFlagCategories: [],
  reviewCategories: [],
  reportableCategories: []
};

const DATASET_KEYS = ['soae', 'dispatch', 'incidents', 'accidents', 'downed'];

/**
 * Get dashboard data from configured source
 * @returns {Promise<Object>} Dashboard data object
 */
export async function getDashboardData() {
  switch (DATA_CONFIG.mode) {
    case 'api':
      return fetchFromApi();
    case 'sharepoint':
      return fetchFromSharePoint();
    default:
      return getEmptyData();
  }
}

/**
 * Get empty data (used until CSV is loaded)
 * @returns {Promise<Object>}
 */
async function getEmptyData() {
  return buildDashboardData({
    soae: [],
    dispatch: [],
    incidents: [],
    accidents: [],
    downed: []
  });
}

/**
 * Fetch data from REST API
 * @returns {Promise<Object>} Dashboard data
 */
async function fetchFromApi() {
  try {
    const response = await fetch(DATA_CONFIG.apiUrl);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch from API:', error);
    // Fallback to empty data
    return getEmptyData();
  }
}

/**
 * Fetch data from SharePoint List via REST API
 * @returns {Promise<Object>} Dashboard data
 */
async function fetchFromSharePoint() {
  const { siteUrl, listName } = DATA_CONFIG.sharepoint;
  const endpoint = `${siteUrl}/_api/web/lists/getbytitle('${listName}')/items`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json;odata=nometadata'
      }
    });
    if (!response.ok) {
      throw new Error(`SharePoint error: ${response.status}`);
    }
    const result = await response.json();
    return transformSharePointData(result.value);
  } catch (error) {
    console.error('Failed to fetch from SharePoint:', error);
    // Fallback to empty data
    return getEmptyData();
  }
}

/**
 * Transform SharePoint list items to dashboard format
 * @param {Array} items - SharePoint list items
 * @returns {Object} Dashboard data format
 */
function transformSharePointData(items) {
  // TODO: Implement transformation based on your SharePoint list structure
  // This is a placeholder that returns items as-is
  return {
    generated: new Date().toISOString(),
    config: DEFAULT_CONFIG,
    filters: {},
    metrics: calculateMetrics(items),
    data: groupDataBySource(items),
    trends: calculateTrends(items)
  };
}

/**
 * Calculate metrics from raw data
 * @param {Array} items - Raw data items
 * @returns {Object} Calculated metrics
 */
function calculateMetrics(items) {
  // Placeholder implementation
  return {};
}

/**
 * Group data by source
 * @param {Array} items - Raw data items
 * @returns {Object} Grouped data
 */
function groupDataBySource(items) {
  // Placeholder implementation
  return {
    soae: items || [],
    dispatch: [],
    incidents: [],
    accidents: [],
    downed: []
  };
}

/**
 * Calculate trend data
 * @param {Array} items - Raw data items
 * @returns {Object} Trend data
 */
function calculateTrends(items) {
  // Placeholder implementation
  return {};
}

/**
 * Refresh data (for manual refresh functionality)
 * @returns {Promise<Object>} Fresh dashboard data
 */
export async function refreshData() {
  // Clear any cache here if implemented
  return getDashboardData();
}

/**
 * Get configuration
 * @returns {Object} Data service configuration
 */
export function getConfig() {
  return { ...DATA_CONFIG };
}

/**
 * Update configuration (for runtime config changes)
 * @param {Object} newConfig - New configuration values
 */
export function updateConfig(newConfig) {
  Object.assign(DATA_CONFIG, newConfig);
}

/**
 * Load and transform CSV files into dashboard data.
 * @param {File[]|FileList} files
 * @returns {Promise<{data: Object, warnings: string[]}>}
 */
export async function loadCsvFiles(files) {
  const fileList = Array.from(files || []);
  const sizeResult = validateReportSizes(fileList);
  if (sizeResult.error) {
    throw new Error(sizeResult.error);
  }
  const datasets = {
    soae: [],
    dispatch: [],
    incidents: [],
    accidents: [],
    downed: []
  };
  const warnings = [];

  for (const file of fileList) {
    let datasetKey = getDatasetKeyFromFilename(file.name);

    const extension = getFileExtension(file.name);
    let records = [];
    let detectedHeaders = null;

    if (extension === 'csv') {
      const text = await file.text();
      const rows = parseCsvText(text);
      const dataRows = stripSchemaRow(rows);
      if (dataRows.length === 0) {
        warnings.push(`No data rows found in ${file.name}`);
        continue;
      }
      detectedHeaders = dataRows[0];
      records = csvRowsToObjects(dataRows);
    } else if (extension === 'xlsx') {
      const result = await parseXlsxFile(file);
      records = result.records;
      detectedHeaders = result.headers;
    } else if (extension === 'eml') {
      const result = await parseDownedEmail(file);
      records = result.records;
    } else {
      warnings.push(`Unsupported file type: ${file.name}`);
      continue;
    }

    if (!datasetKey && detectedHeaders) {
      datasetKey = getDatasetKeyFromHeaders(detectedHeaders);
    }

    if (!datasetKey) {
      warnings.push(`Could not detect dataset for ${file.name}`);
      continue;
    }

    const normalized = records
      .map((record) => normalizeRecord(datasetKey, record))
      .filter((record) => hasMeaningfulValue(record));

    if (datasetKey === 'accidents') {
      normalized.forEach((record) => {
        const targetKey = getSafetyDatasetKey(record);
        datasets[targetKey].push(record);
      });
    } else {
      datasets[datasetKey].push(...normalized);
    }
  }

  return {
    data: buildDashboardData(datasets),
    warnings
  };
}

function getDatasetKeyFromFilename(filename) {
  const name = filename.toLowerCase();
  if (name.includes('soae')) return 'soae';
  if (name.includes('dispatch')) return 'dispatch';
  if (name.includes('incident')) return 'incidents';
  if (name.includes('accident')) return 'accidents';
  if (name.includes('safety')) return 'accidents';
  if (name.includes('down')) return 'downed';
  return null;
}

function getDatasetKeyFromHeaders(headers) {
  const lower = headers.map((h) => h.toLowerCase());
  if (lower.some((h) => h.includes('hourstocreate')) || lower.includes('timeliness')) {
    return 'soae';
  }
  if (lower.includes('eventdate') && lower.includes('eventtype') && lower.includes('created')) {
    return 'soae';
  }
  if (lower.includes('accident type') || lower.includes('type of accident')) {
    return 'accidents';
  }
  if (lower.includes('incidenttype')) {
    return 'incidents';
  }
  if (lower.includes('accidenttype')) {
    return 'accidents';
  }
  if (lower.includes('downed') || lower.includes('downedvehicles')) {
    return 'downed';
  }
  if (lower.includes('eventtype') && lower.includes('incidentdescription')) {
    return 'dispatch';
  }
  return null;
}

function buildDashboardData(datasets) {
  const allRecords = DATASET_KEYS.flatMap((key) => datasets[key] || []);
  const dates = new Set();
  const months = new Set();
  const eventTypes = new Set();

  allRecords.forEach((record) => {
    if (record.date) {
      dates.add(record.date);
      if (record.date.length >= 7) {
        months.add(record.date.slice(0, 7));
      }
    }
    if (record.yearMonth) {
      months.add(record.yearMonth);
    }
  });

  (datasets.soae || []).forEach((record) => {
    if (record.eventType) {
      eventTypes.add(record.eventType);
    }
  });

  return {
    generated: new Date().toISOString(),
    config: DEFAULT_CONFIG,
    filters: {
      months: Array.from(months).sort(),
      dates: Array.from(dates).sort(),
      eventTypes: Array.from(eventTypes).sort(),
      sources: []
    },
    metrics: {},
    data: datasets,
    trends: {}
  };
}

function normalizeRecord(datasetKey, record) {
  const normalized = mapRecordFields(record);
  const numericFields = {
    soae: ['hoursToCreate', 'ld'],
    dispatch: ['daysOverdue', 'ld'],
    incidents: ['daysOverdue', 'ld'],
    accidents: ['daysOverdue', 'ld'],
    downed: ['daysOverdue', 'ld']
  };
  const booleanFields = {
    dispatch: ['missing', 'needsReview'],
    incidents: ['missing', 'needsReview'],
    accidents: ['missing', 'needsReview'],
    downed: ['missing', 'needsReview']
  };

  normalizeDateFields(normalized);

  (numericFields[datasetKey] || []).forEach((field) => {
    normalized[field] = toNumber(normalized[field]);
  });

  (booleanFields[datasetKey] || []).forEach((field) => {
    normalized[field] = toBoolean(normalized[field]);
  });

  if (!normalized.yearMonth && normalized.date) {
    normalized.yearMonth = normalized.date.slice(0, 7);
  }

  normalizeZeroFields(normalized);

  if (datasetKey === 'soae') {
    if ((normalized.hoursToCreate === null || normalized.hoursToCreate === undefined) &&
      (normalized.eventDateTime || normalized.date) && normalized.createdTime) {
      normalized.hoursToCreate = calculateHoursDiff(
        normalized.eventDateTime || normalized.date,
        normalized.createdTime
      );
    }

    if (!normalized.timeliness && normalized.hoursToCreate !== null && normalized.hoursToCreate !== undefined) {
      normalized.timeliness = normalized.hoursToCreate > DEFAULT_CONFIG.onTimeHours ? 'Late' : 'On time';
    }

    if (normalized.timeliness === 'Late' && (normalized.ld === null || normalized.ld === undefined)) {
      normalized.ld = calculateLdForLate(normalized.hoursToCreate, DEFAULT_CONFIG);
    }
  } else {
    if (normalized.missing && normalized.date) {
      normalized.daysOverdue = calculateDaysOverdue(normalized.date);
    }

    if (normalized.missing && (normalized.ld === null || normalized.ld === undefined)) {
      normalized.ld = calculateLdForMissing(normalized.daysOverdue, DEFAULT_CONFIG);
    }
  }

  return normalized;
}

function normalizeZeroFields(record) {
  ['vehicle', 'route', 'run'].forEach((key) => {
    if (String(record[key] || '').trim() === '0') {
      record[key] = '';
    }
  });
}

function hasMeaningfulValue(record) {
  if (!record || typeof record !== 'object') return false;
  const keyFields = ['date', 'eventType', 'category', 'incidentType', 'vehicle', 'id', 'comment'];
  const hasKeyValue = keyFields.some((key) => isMeaningfulValue(record[key]));
  if (hasKeyValue) return true;
  return Object.values(record).some((value) => isMeaningfulValue(value));
}

function isMeaningfulValue(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return false;
  if (normalized === '#' || normalized === '0') return false;
  if (normalized.toLowerCase() === 'nan') return false;
  return true;
}

function formatDateParts(yearValue, monthValue, dayValue) {
  const year = normalizeYear(yearValue);
  const month = String(monthValue).padStart(2, '0');
  const day = String(dayValue).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeYear(value) {
  const str = String(value);
  if (str.length === 2) {
    return `20${str}`;
  }
  return str;
}

function parseDateParts(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) };
  }
  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (slash) {
    return {
      year: Number(normalizeYear(slash[3])),
      month: Number(slash[1]),
      day: Number(slash[2])
    };
  }
  const dash = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})/);
  if (dash) {
    return {
      year: Number(normalizeYear(dash[3])),
      month: Number(dash[1]),
      day: Number(dash[2])
    };
  }
  return null;
}

function to24Hour(hour, meridiem) {
  let h = Number(hour);
  const mer = String(meridiem || '').toUpperCase();
  if (mer === 'PM' && h < 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return h;
}

function getSafetyDatasetKey(record) {
  const flag = String(record.accidentClass || '').trim().toLowerCase();
  if (flag === 'incident' || flag === 'incidents') {
    return 'incidents';
  }
  return 'accidents';
}

function stripSchemaRow(rows) {
  if (!rows || rows.length === 0) return [];
  const firstCell = rows[0]?.[0] || '';
  if (typeof firstCell === 'string' && firstCell.startsWith('ListSchema=')) {
    return rows.slice(1);
  }
  return rows;
}

function normalizeDateFields(record) {
  if (record.date) {
    record.date = normalizeDate(record.date);
  }
  if (record.eventDateTime) {
    record.eventDateTime = normalizeDateTime(record.eventDateTime);
  }
  if (record.createdTime) {
    record.createdTime = normalizeDateTime(record.createdTime);
  }
  return record;
}

function normalizeDate(value) {
  if (!value) return value;
  const trimmed = String(value).trim();
  const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (isoMatch) return isoMatch[1];
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) return trimmed.replace(/\//g, '-');

  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (slash) {
    return formatDateParts(slash[3], slash[1], slash[2]);
  }

  const dash = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})/);
  if (dash) {
    return formatDateParts(dash[3], dash[1], dash[2]);
  }

  return trimmed;
}

function normalizeDateTime(value) {
  if (!value) return value;
  const trimmed = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString();
  }

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (match) {
    const [, month, day, year, hour, minute, second, meridiem] = match;
    const hour24 = to24Hour(Number(hour), meridiem);
    const dateObj = new Date(
      Number(normalizeYear(year)),
      Number(month) - 1,
      Number(day),
      hour24,
      Number(minute),
      Number(second || 0)
    );
    return Number.isNaN(dateObj.getTime()) ? trimmed : dateObj.toISOString();
  }

  return trimmed;
}

function calculateHoursDiff(dateValue, createdValue) {
  const eventDate = new Date(dateValue);
  const createdDate = new Date(createdValue);
  if (Number.isNaN(eventDate.getTime()) || Number.isNaN(createdDate.getTime())) {
    return null;
  }
  return (createdDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60);
}

function calculateDaysOverdue(dateValue) {
  if (!dateValue) return null;
  const dateParts = parseDateParts(dateValue);
  if (!dateParts) return null;
  const eventDate = new Date(dateParts.year, dateParts.month - 1, dateParts.day);
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.floor((todayMidnight.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
}

function calculateLdForLate(hoursLate, config) {
  if (hoursLate === null || hoursLate === undefined) return null;
  const excessHours = Math.max(0, hoursLate - (config.onTimeHours || 24));
  if (excessHours <= 0) return 0;
  const daysLate = Math.ceil(excessHours / 24);
  return (config.ldBase || 0) + daysLate * (config.ldPerDay || 0);
}

function calculateLdForMissing(daysOverdue, config) {
  if (daysOverdue === null || daysOverdue === undefined) return null;
  if (daysOverdue <= 0) return 0;
  return (config.ldBase || 0) + daysOverdue * (config.ldPerDay || 0);
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined || value === '') return false;
  const normalized = String(value).trim().toLowerCase();
  if (['true', 'yes', 'y', '1'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0'].includes(normalized)) return false;
  return false;
}

function mapRecordFields(record) {
  if (!record || typeof record !== 'object') return {};
  const mapped = {};
  const lowerMap = new Map();

  Object.keys(record).forEach((key) => {
    lowerMap.set(key.toLowerCase(), record[key]);
  });

  const aliases = {
    id: ['id', 'title', 'soae id#', 'soae id'],
    date: ['date', 'eventdate', 'event date', 'entry date'],
    eventDateTime: ['eventdate', 'event date'],
    eventType: ['eventtype', 'event type'],
    category: ['category', 'eventtype', 'event type', 'accident type', 'type of accident'],
    incidentType: ['incidenttype', 'incident type', 'accident type', 'type of accident'],
    accidentClass: ['accident'],
    riskPerspective: ['p / np - risk perspective', 'risk perspective', 'risk'],
    comment: ['comment', 'comments', 'incidentdescription', 'incident description', 'notes', 'detail'],
    vehicle: ['vehicle', 'veh #', 'veh.', 'veh'],
    route: ['route', 'route #'],
    run: ['run'],
    driver: ['driver', 'drivername', 'driver name', 'employee'],
    createdTime: ['created', 'createdtime', 'created time'],
    createdBy: ['created by', 'createdby'],
    statusText: ['status'],
    hoursToCreate: ['hourstocreate', 'hours to create'],
    timeliness: ['timeliness'],
    ld: ['ld', 'liquidateddamages', 'liquidated damages'],
    missing: ['missing'],
    needsReview: ['needsreview', 'needs review'],
    daysOverdue: ['daysoverdue', 'days overdue']
  };

  Object.entries(aliases).forEach(([target, keys]) => {
    for (const key of keys) {
      if (lowerMap.has(key)) {
        const value = lowerMap.get(key);
        if (value !== undefined && value !== '') {
          mapped[target] = value;
        }
        break;
      }
    }
  });

  return { ...record, ...mapped };
}

function getFileExtension(filename) {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

function validateReportSizes(files) {
  const maxTotalBytes = 200 * 1024 * 1024;
  const maxFileBytes = 50 * 1024 * 1024;
  let total = 0;

  for (const file of files) {
    const size = Number(file?.size || 0);
    if (size > maxFileBytes) {
      return {
        error: `File too large: ${file.name}. Max per file is ${Math.floor(maxFileBytes / (1024 * 1024))}MB.`
      };
    }
    total += size;
  }

  if (total > maxTotalBytes) {
    return {
      error: `Total upload size too large. Max total is ${Math.floor(maxTotalBytes / (1024 * 1024))}MB.`
    };
  }

  return { error: null };
}

async function parseXlsxFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const xlsx = await import('xlsx');
  const workbook = xlsx.read(arrayBuffer, { type: 'array' });
  const allRecords = [];
  let firstHeaders = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
    const dataRows = stripSchemaRow(rows);
    if (dataRows.length === 0) return;

    const headerIndex = findHeaderRowIndex(dataRows);
    if (headerIndex === -1 || headerIndex >= dataRows.length) return;
    const trimmedRows = dataRows.slice(headerIndex);
    if (trimmedRows.length === 0) return;

    if (firstHeaders.length === 0) {
      firstHeaders = trimmedRows[0];
    }
    const records = csvRowsToObjects(trimmedRows);
    allRecords.push(...records);
  });

  if (allRecords.length === 0) {
    return { records: [], headers: [] };
  }

  return { records: allRecords, headers: firstHeaders };
}

function findHeaderRowIndex(rows) {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i] || [];
    const nonEmpty = row.filter((cell) => String(cell || '').trim() !== '').length;
    if (nonEmpty < 3) continue;
    const hasDate = row.some((cell) => String(cell || '').toLowerCase().includes('date'));
    if (hasDate) return i;
  }

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i] || [];
    const nonEmpty = row.filter((cell) => String(cell || '').trim() !== '').length;
    if (nonEmpty >= 3) return i;
  }

  return -1;
}

async function parseDownedEmail(file) {
  const text = await file.text();
  const records = [];
  const subjectMatch = text.match(/Subject:\\s*(.*)/i);
  const subject = subjectMatch ? subjectMatch[1] : '';
  const dateFromSubject = extractDateFromSubject(subject);

  const plainText = extractPlainTextBody(text);
  if (!plainText) {
    return { records };
  }

  let section = null;
  plainText.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (/downed vehicles/i.test(trimmed)) {
      section = 'Downed Vehicles';
      return;
    }
    if (/unfueled vehicles/i.test(trimmed)) {
      section = 'Unfueled Vehicles';
      return;
    }
    if (!section || !/^\d+/.test(trimmed)) return;

    const parts = trimmed.split(' - ');
    const vehicle = parts[0]?.trim();
    const comment = parts.slice(1).join(' - ').trim();
    records.push({
      date: dateFromSubject,
      vehicle,
      comment: comment || section,
      category: section,
      missing: true
    });
  });

  return { records };
}

function extractPlainTextBody(emlText) {
  const marker = 'content-type: text/plain';
  const lower = emlText.toLowerCase();
  const startIndex = lower.indexOf(marker);
  if (startIndex === -1) return '';
  const afterMarker = emlText.slice(startIndex);
  const parts = afterMarker.split(/\r?\n\r?\n/);
  if (parts.length < 2) return '';
  const body = parts.slice(1).join('\n\n');
  const boundaryIndex = body.search(/\r?\n--_/);
  const cleaned = boundaryIndex >= 0 ? body.slice(0, boundaryIndex) : body;
  return cleaned.trim();
}

function extractDateFromSubject(subject) {
  if (!subject) return null;
  const match = subject.match(/(\\d{1,2})[\\/-](\\d{1,2})[\\/-](\\d{2,4})/);
  if (!match) return null;
  const [, month, day, yearRaw] = match;
  const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export default {
  getDashboardData,
  refreshData,
  loadCsvFiles,
  getConfig,
  updateConfig
};
