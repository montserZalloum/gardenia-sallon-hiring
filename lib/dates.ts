export const SALON_TIMEZONE = "Asia/Amman";

// Storage convention: expiryDate is the UTC midnight of the chosen YYYY-MM-DD.
// Comparing against the salon's local "today" keeps the cutoff aligned with what
// the admin and applicants see, regardless of the server's own timezone.
export function startOfTodayInSalonTZ(): Date {
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: SALON_TIMEZONE,
  }).format(new Date());
  return new Date(`${todayStr}T00:00:00Z`);
}
