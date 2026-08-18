export function toDateKey(date) {
  if (!date) {
    return "";
  }

  /*
   * Jika sudah berupa string YYYY-MM-DD,
   * langsung gunakan tanpa new Date().
   *
   * Ini penting supaya tidak terkena masalah
   * timezone saat parsing tanggal API.
   */
  if (typeof date === "string") {
    return date.slice(0, 10);
  }

  /*
   * Jika Date object
   */
  if (date instanceof Date) {
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return "";
}

export function getCalendarDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);

  /*
   * Minggu = 0
   * Senin = 1
   * ...
   * Sabtu = 6
   */
  const startDay = firstDay.getDay();

  const startDate = new Date(year, month, 1 - startDay);

  const days = [];

  /*
   * 6 minggu x 7 hari
   */
  for (let i = 0; i < 42; i += 1) {
    days.push(
      new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + i
      )
    );
  }

  return days;
}

export function isSameDate(dateA, dateB) {
  if (!dateA || !dateB) {
    return false;
  }

  /*
   * Pastikan keduanya Date object
   */
  const a = dateA instanceof Date ? dateA : new Date(`${dateA}T00:00:00`);

  const b = dateB instanceof Date ? dateB : new Date(`${dateB}T00:00:00`);

  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
    return false;
  }

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getMonthLabel(date) {
  if (!(date instanceof Date)) {
    return "";
  }

  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}
