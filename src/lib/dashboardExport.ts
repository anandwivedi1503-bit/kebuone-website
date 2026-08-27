function csvCell(value: unknown) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

export function downloadCsv(
  filename: string,
  rows: Record<string, unknown>[]
) {
  const headers = rows[0] ? Object.keys(rows[0]) : ["message"];
  const body = rows.length
    ? rows.map((row) => headers.map((key) => csvCell(row[key])).join(","))
    : [csvCell("No rows")];
  const csv = ["\uFEFF" + headers.join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function printDashboard() {
  window.print();
}

export function downloadHtmlFile(filename: string, html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".html") ? filename : `${filename}.html`;
  link.click();
  URL.revokeObjectURL(url);
}
