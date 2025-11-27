// src/utils/dateUtils.js
export const formatDateLocal = (date) => {
  // Handle undefined/null input
  if (!date) return '';

  // Handle string dates by creating a Date object
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return '';

  // Calculate local date
  const offset = dateObj.getTimezoneOffset();
  const localDate = new Date(dateObj.getTime() - offset * 60 * 1000);

  // Return formatted date
  return localDate.toISOString().split("T")[0];
};