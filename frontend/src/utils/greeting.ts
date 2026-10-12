/**
 * Time-based greeting utility using local browser/device time.
 * Logic:
 * - 05:00 AM – 11:59 AM (05:00 - 11:59) -> "Good Morning"
 * - 12:00 PM – 04:59 PM (12:00 - 16:59) -> "Good Afternoon"
 * - 05:00 PM – 08:59 PM (17:00 - 20:59) -> "Good Evening"
 * - 09:00 PM – 04:59 AM (21:00 - 04:59) -> "Good Night"
 */

export function getTimeBasedGreeting(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good Evening";
  }

  return "Good Night";
}

/**
 * Returns formatted greeting with optional user name:
 * e.g., "Good Afternoon, Nikhil 👋"
 */
export function getUserGreeting(userName?: string, date: Date = new Date()): string {
  const greeting = getTimeBasedGreeting(date);
  if (!userName || !userName.trim()) {
    return `${greeting} 👋`;
  }

  // If full name is provided, extract first name or use as provided
  const nameParts = userName.trim().split(' ');
  const displayName = nameParts[0];

  return `${greeting}, ${displayName} 👋`;
}
