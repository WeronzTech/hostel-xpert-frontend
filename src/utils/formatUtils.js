import dayjs from "dayjs";

/**
 * Convert a date string to 'DD-MM-YYYY' format
 * @param {string | Date} date - ISO string or Date object
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  return dayjs(dateString).format("DD-MM-YYYY");
};

/**
 * Formats specific keys to readable labels.
 * @param {string} value
 * @returns {string}
 */
export function formatLabel(value) {
  if (!value) return "";

  const map = {
    worker: "Worker",
    student: "Student",
    dailyRent: "Daily Rent",
    messOnly: "Mess Only",
  };

  return map[value] || value.charAt(0).toUpperCase() + value.slice(1);
}
