export function rentalEndAtStart(
  startedAt: Date,
  rentalMode: string,
  rentalHours?: number,
  rentToOwnMonths?: number
) {
  const end = new Date(startedAt);
  switch (String(rentalMode || "")) {
    case "Hourly":
      end.setHours(end.getHours() + Math.min(72, Math.max(1, Math.round(Number(rentalHours) || 1))));
      return end;
    case "Daily":
      end.setDate(end.getDate() + 1);
      return end;
    case "Weekly":
      end.setDate(end.getDate() + 7);
      return end;
    case "Monthly":
      end.setMonth(end.getMonth() + 1);
      return end;
    case "Rent To Own":
      end.setMonth(end.getMonth() + Math.max(1, Math.round(Number(rentToOwnMonths) || 20)));
      return end;
    default:
      return null;
  }
}
