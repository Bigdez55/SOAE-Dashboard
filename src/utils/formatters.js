/**
 * Format a number as currency (USD)
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  const num = value || 0;
  return `$${num.toLocaleString('en-US')}`;
};

/**
 * Format a number as percentage
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPct = (value, decimals = 1) => {
  const num = value || 0;
  return `${num.toFixed(decimals)}%`;
};

/**
 * Format a number with thousand separators
 * @param {number} value - The value to format
 * @returns {string} Formatted number string
 */
export const formatNum = (value) => {
  const num = value || 0;
  return num.toLocaleString('en-US');
};

/**
 * Format a date string for display
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format a date string as short format (MM/DD)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Short formatted date
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric'
  });
};

/**
 * Get month name from YYYY-MM format
 * @param {string} yearMonth - Date string in YYYY-MM format
 * @returns {string} Month name with year
 */
export const getMonthName = (yearMonth) => {
  const monthNames = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
    '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
  };

  if (!yearMonth) return '-';
  const [year, month] = yearMonth.split('-');
  return `${monthNames[month] || month} ${year}`;
};

/**
 * Get best available identifier from a record
 * @param {Object} record - Data record with vehicle, run, route fields
 * @returns {string} Best available identifier
 */
export const getIdentifier = (record) => {
  if (record.vehicle && record.vehicle !== '' && record.vehicle !== 'nan' && record.vehicle !== '0') {
    return `V${record.vehicle}`;
  }
  if (record.run && record.run !== '') {
    return `Run ${record.run}`;
  }
  if (record.route && record.route !== '') {
    return `Rt ${record.route}`;
  }
  return '-';
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
