export const birr = (value) => `ETB ${Number(value || 0).toLocaleString('en-ET', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
