function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function createMinutesSheetCsv({
  title,
  date,
  owner,
  agenda,
  minutes,
  storage,
  storagePath,
}: {
  title: string;
  date: string;
  owner: string;
  agenda: string;
  minutes: string;
  storage: string;
  storagePath: string;
}) {
  const rows = [
    ["Meeting", title],
    ["Date", date],
    ["Owner", owner],
    ["Agenda", agenda],
    ["Minutes", minutes],
    ["Storage", storage],
    ["Storage Path", storagePath],
  ];

  return rows.map(([label, value]) => `${escapeCsv(label)},${escapeCsv(value)}`).join("\n");
}

export function downloadMinutesSheet(
  filename: string,
  csv: string,
) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  anchor.click();

  URL.revokeObjectURL(url);
}
