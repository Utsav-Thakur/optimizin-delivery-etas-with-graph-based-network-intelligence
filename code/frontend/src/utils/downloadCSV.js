/**
 * downloadCSV — converts an array of objects to a CSV file and triggers browser download.
 * No browser storage, no API calls — pure client-side generation.
 *
 * @param {Array<Object>} rows   - Array of flat objects (one per CSV row)
 * @param {string}        filename - Filename without extension
 * @param {string[]}      [columns] - Optional ordered column list (defaults to all keys of first row)
 */
export function downloadCSV(rows, filename, columns) {
  if (!rows || rows.length === 0) return;

  const cols = columns || Object.keys(rows[0]);

  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    // Wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = cols.map(escape).join(',');
  const body = rows.map(row => cols.map(c => escape(row[c])).join(',')).join('\n');
  const csv = `${header}\n${body}`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
