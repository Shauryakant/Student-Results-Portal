/**
 * Sanitizes a CSV cell to prevent spreadsheet formula injection (CSV injection).
 * If the value starts with =, +, -, @, or tab/CR, it prefixes it with a single quote.
 * Quotes and commas are properly escaped per RFC 4180.
 */
export function sanitizeCsvCell(value: string | number | undefined | null): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Formula injection guard: Excel/LibreOffice/Google Sheets execute cells starting with =, +, -, @
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // RFC 4180 CSV escaping: if contains quotes, commas, or newlines, wrap in quotes and double quotes
  if (
    str.includes('"') ||
    str.includes(',') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}
