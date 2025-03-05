import { debug } from "@tauri-apps/plugin-log";

/**
 * Converts a given date to a relative time string (e.g., "5 minutes ago").
 *
 * @param date - The date to be converted to a relative time string.
 * @returns A string representing the relative time from the given date to now.
 */
export function toRelativeStr(date: Date): string {
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);

	debug("Seconds: " + seconds);
	debug("Minutes: " + minutes);
	debug("Hours: " + hours);
	debug("Days: " + days);

	if (months > 0) {
		return months === 1 ? "1 month ago" : `${months} months ago`;
	}
	if (days > 0) {
		return days === 1 ? "1 day ago" : `${days} days ago`;
	}
	if (hours > 0) {
		return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
	}
	if (minutes > 0) {
		return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
	}
	if (seconds > 0) {
		return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
	}
	return "just now";
}
