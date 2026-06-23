export function exportToCsv<T>(filename: string, rows: T[], headers: { key: keyof T | string, label: string }[]) {
  if (!rows || !rows.length) return;

  const csvRows = [];
  
  // Headers
  csvRows.push(headers.map(h => `"${h.label}"`).join(","));
  
  // Data
  for (const row of rows) {
    const values = headers.map(header => {
      // Allow nested dot notation like "employee.name" if needed in the future,
      // but for now simple key access is fine.
      const val = (row as Record<string, unknown>)[header.key as string];
      const escaped = (val === null || val === undefined ? "" : String(val)).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
