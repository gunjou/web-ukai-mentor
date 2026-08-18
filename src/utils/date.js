/**
 * Date Utilities
 *
 * Centralized helper untuk:
 * - mendapatkan tanggal hari ini
 * - format tanggal
 * - format waktu
 * - format tanggal + waktu
 * - perbandingan tanggal
 */

/**
 * Mengubah value menjadi Date.
 *
 * Mendukung:
 * - Date
 * - ISO string
 * - YYYY-MM-DD
 */
export function toDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Mendapatkan tanggal hari ini
 * dalam format YYYY-MM-DD.
 *
 * Contoh:
 * 2026-08-16
 */
export function getToday() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Format YYYY-MM-DD menjadi:
 *
 * 16 Agustus 2026
 */
export function formatDate(value, options = {}) {
  const date = toDate(value);

  if (!date) {
    return "-";
  }

  const { locale = "id-ID", dateStyle = "long" } = options;

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
  }).format(date);
}

/**
 * Format tanggal pendek.
 *
 * Contoh:
 * 16/08/2026
 */
export function formatDateShort(value, options = {}) {
  const date = toDate(value);

  if (!date) {
    return "-";
  }

  const { locale = "id-ID" } = options;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Format waktu.
 *
 * Contoh:
 * 07:54
 */
export function formatTime(value, options = {}) {
  const date = toDate(value);

  if (!date) {
    return "-";
  }

  const { locale = "id-ID" } = options;

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Format tanggal dan waktu.
 *
 * Contoh:
 * 16 Agustus 2026, 07:54
 */
export function formatDateTime(value, options = {}) {
  const date = toDate(value);

  if (!date) {
    return "-";
  }

  const { locale = "id-ID" } = options;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Format tanggal untuk input[type="date"].
 *
 * Menghasilkan:
 * YYYY-MM-DD
 */
export function toInputDate(value) {
  const date = toDate(value);

  if (!date) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Mengecek apakah tanggal adalah hari ini.
 */
export function isToday(value) {
  return toInputDate(value) === getToday();
}

/**
 * Membandingkan dua tanggal.
 */
export function isSameDate(first, second) {
  const firstDate = toInputDate(first);

  const secondDate = toInputDate(second);

  return firstDate && secondDate && firstDate === secondDate;
}

/**
 * Mendapatkan nama hari.
 *
 * Contoh:
 * Minggu
 */
export function getDayName(value, options = {}) {
  const date = toDate(value);

  if (!date) {
    return "-";
  }

  const { locale = "id-ID", short = false } = options;

  return new Intl.DateTimeFormat(locale, {
    weekday: short ? "short" : "long",
  }).format(date);
}

/**
 * Mendapatkan nama bulan.
 *
 * Contoh:
 * Agustus
 */
export function getMonthName(value, options = {}) {
  const date = toDate(value);

  if (!date) {
    return "-";
  }

  const { locale = "id-ID" } = options;

  return new Intl.DateTimeFormat(locale, {
    month: "long",
  }).format(date);
}
export function formatLongDate(date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
