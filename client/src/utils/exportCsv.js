/**
 * Utility to convert tabular data into a downloadable CSV file.
 * Automatically escapes commas, quotes, and newlines.
 */
export function exportToCsv(filename, headers, rows) {
  if (!rows || !rows.length) {
    alert("No data available to export.");
    return;
  }

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map((h) => escapeCell(h.label || h.key || h)).join(",");
  const dataLines = rows.map((row) => {
    return headers
      .map((h) => {
        const key = typeof h === "object" ? h.key : h;
        const val = typeof h.formatter === "function" ? h.formatter(row[key], row) : row[key];
        return escapeCell(val);
      })
      .join(",");
  });

  const csvContent = [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
