// Utility functions for filtering jobs by dates

export interface DateTimeEntry {
  date: string; // ISO format: YYYY-MM-DD
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
}

/**
 * Check if a job's dates fall within a date range
 */
export function isJobInDateRange(
  jobDates: DateTimeEntry[],
  startDate: string,
  endDate: string
): boolean {
  return jobDates.some((entry) => {
    const jobDate = new Date(entry.date);
    const start = new Date(startDate);
    const end = new Date(endDate);

    return jobDate >= start && jobDate <= end;
  });
}

/**
 * Check if a job has dates on or after a specific date
 */
export function hasUpcomingDates(
  jobDates: DateTimeEntry[],
  fromDate: string = new Date().toISOString().split("T")[0]
): boolean {
  const from = new Date(fromDate);
  return jobDates.some((entry) => new Date(entry.date) >= from);
}

/**
 * Get the earliest date from a job's dates
 */
export function getEarliestDate(jobDates: DateTimeEntry[]): Date | null {
  if (jobDates.length === 0) return null;

  const dates = jobDates.map((entry) => new Date(entry.date));
  return new Date(Math.min(...dates.map((d) => d.getTime())));
}

/**
 * Get the latest date from a job's dates
 */
export function getLatestDate(jobDates: DateTimeEntry[]): Date | null {
  if (jobDates.length === 0) return null;

  const dates = jobDates.map((entry) => new Date(entry.date));
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

/**
 * Sort jobs by their earliest date
 */
export function sortByEarliestDate<T extends { dates: DateTimeEntry[] }>(
  jobs: T[],
  ascending: boolean = true
): T[] {
  return [...jobs].sort((a, b) => {
    const dateA = getEarliestDate(a.dates);
    const dateB = getEarliestDate(b.dates);

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    return ascending
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });
}

/**
 * Filter jobs by specific month and year
 */
export function filterByMonth(
  jobDates: DateTimeEntry[],
  month: number, // 0-11
  year: number
): boolean {
  return jobDates.some((entry) => {
    const date = new Date(entry.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
}

/**
 * Get duration in days between earliest and latest date
 */
export function getEventDuration(jobDates: DateTimeEntry[]): number {
  const earliest = getEarliestDate(jobDates);
  const latest = getLatestDate(jobDates);

  if (!earliest || !latest) return 0;

  const diffTime = Math.abs(latest.getTime() - earliest.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days

  return diffDays;
}

/**
 * Format date range for display
 */
export function formatDateRange(jobDates: DateTimeEntry[]): string {
  const earliest = getEarliestDate(jobDates);
  const latest = getLatestDate(jobDates);

  if (!earliest) return "No dates";

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  if (!latest || earliest.getTime() === latest.getTime()) {
    return earliest.toLocaleDateString("en-US", options);
  }

  return `${earliest.toLocaleDateString(
    "en-US",
    options
  )} - ${latest.toLocaleDateString("en-US", options)}`;
}

/**
 * Convert 24-hour time format to 12-hour AM/PM format
 * @param time24 - Time in 24-hour format (e.g., "09:00", "17:30")
 * @returns Time in 12-hour format (e.g., "9:00 AM", "5:30 PM")
 */
export function formatTimeTo12Hour(time24: string): string {
  if (!time24) return "";

  const [hours, minutes] = time24.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) return time24;

  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight

  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format time range for display (converts 24hr to 12hr AM/PM)
 * @param startTime - Start time in 24-hour format
 * @param endTime - End time in 24-hour format
 * @returns Formatted time range string
 */
export function formatTimeRange(startTime?: string, endTime?: string): string {
  if (!startTime && !endTime) return "";

  if (startTime && endTime) {
    return `${formatTimeTo12Hour(startTime)} - ${formatTimeTo12Hour(endTime)}`;
  }

  if (startTime) {
    return `from ${formatTimeTo12Hour(startTime)}`;
  }

  return `until ${formatTimeTo12Hour(endTime!)}`;
}
