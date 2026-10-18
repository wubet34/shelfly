function escapeCell(value) {
  let cell = value == null ? '' : String(value);
  if (/^[\s]*[=+\-@\t\r]/.test(cell)) cell = `'${cell}`;
  return `"${cell.replaceAll('"', '""')}"`;
}

export function downloadCsv(filename, headers, rows) {
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
