/**
 * Parse CSV text into rows while handling quoted fields and escaped quotes.
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsvText(text) {
  const cleaned = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i += 1) {
    const char = cleaned[i];
    const next = cleaned[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (char === ',' || char === '\n' || char === '\r')) {
      if (char === ',' ) {
        row.push(field);
        field = '';
        continue;
      }

      if (char === '\r' && next === '\n') {
        i += 1;
      }

      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Convert CSV rows to objects using the first row as headers.
 * @param {string[][]} rows
 * @returns {Object[]}
 */
export function csvRowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());

  return rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] !== undefined ? row[index].trim() : '';
    });
    return record;
  });
}
