export function getWeeksInYear(year: number): number {
  // Get the last day of the year
  const lastDayOfYear = new Date(year, 11, 31); // December 31st

  // Get the ISO week number for the first and last days
  function getISOWeek(date: Date): number {
    const tempDate = new Date(date.getTime());
    tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7)); // Adjust to Thursday
    const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
    return Math.ceil(((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
  const lastWeek = getISOWeek(lastDayOfYear);

  // The number of weeks in a year
  return lastWeek;
}
