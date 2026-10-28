import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getMeetingType,
  getScheduleDate,
  getScheduleEndTime,
  getScheduleStartTime,
  isRescheduled,
} from "./schedule";

// ============================================================
// CONSTANTS
// ============================================================

const COLORS = {
  primary: [211, 140, 14],
  black: [0, 0, 0],
  text: [40, 40, 40],
  muted: [100, 100, 100],
  lightMuted: [120, 120, 120],
  border: [220, 220, 220],
  lightBg: [248, 249, 250],
  alternateRow: [248, 250, 252],
  white: [255, 255, 255],
};

// ============================================================
// FORMATTERS
// ============================================================

function formatDate(date) {
  if (!date) return "-";

  const value = new Date(`${String(date).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatMonth(bulan) {
  if (!bulan) return "-";

  const value = new Date(`${bulan}-01T00:00:00`);

  if (Number.isNaN(value.getTime())) {
    return bulan;
  }

  return value.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "-";

  return String(time).slice(0, 5);
}

/*
 * BELUM_CHECK_IN -> Belum Check In
 */
function formatAttendanceStatus(status) {
  if (!status) return "-";

  return String(status)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toSafeFileName(value) {
  return String(value || "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

// ============================================================
// PDF HELPERS
// ============================================================

function setFont(doc, style = "normal", size = 9, color = COLORS.text) {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

function drawHeader(doc, pageWidth) {
  setFont(doc, "bold", 14, COLORS.primary);

  doc.text("SYNDROME UKAI", pageWidth / 2, 14, {
    align: "center",
  });

  setFont(doc, "normal", 7, [90, 90, 90]);

  doc.text(
    "Email: admin@ukaisyndrome.id | Phone: +62 8895946963",
    pageWidth / 2,
    18,
    {
      align: "center",
    },
  );

  doc.setLineWidth(0.3);
  doc.setDrawColor(...COLORS.primary);
  doc.line(14, 20, pageWidth - 14, 20);
}

function drawInfo(doc, { bulan, className, meetingType }) {
  let y = 30;

  setFont(doc, "bold", 10, COLORS.black);
  doc.text("JADWAL PERTEMUAN WALI KELAS", 14, y);

  y += 7;

  const rows = [
    ["Periode", formatMonth(bulan)],
    ["Kelas", className || "Semua Kelas"],
    [
      "Tipe Pertemuan",
      meetingType && meetingType !== "all" ? meetingType : "Semua Tipe",
    ],
  ];

  rows.forEach(([label, value]) => {
    setFont(doc, "bold", 9, COLORS.black);
    doc.text(label, 14, y);

    setFont(doc, "normal", 9, COLORS.text);
    doc.text(`: ${value}`, 45, y);

    y += 6;
  });

  return y;
}

function drawSummary(doc, schedules, pageWidth, y) {
  y += 2;

  const totalKelas = new Set(schedules.map((item) => item.id_paketkelas)).size;

  const summary = [
    ["Total Jadwal", schedules.length],
    ["Total Kelas", totalKelas],
    [
      "Online",
      schedules.filter((item) => getMeetingType(item) === "ONLINE").length,
    ],
    [
      "Offline",
      schedules.filter((item) => getMeetingType(item) === "OFFLINE").length,
    ],
    ["Reschedule", schedules.filter((item) => isRescheduled(item)).length],
  ];

  const summaryWidth = (pageWidth - 28) / summary.length;

  summary.forEach(([label, value], index) => {
    const x = 14 + index * summaryWidth;

    doc.setDrawColor(...COLORS.border);
    doc.setFillColor(...COLORS.lightBg);

    doc.roundedRect(x, y, summaryWidth - 3, 17, 2, 2, "FD");

    setFont(doc, "normal", 7.5, COLORS.muted);
    doc.text(label, x + 4, y + 6);

    setFont(doc, "bold", 11, COLORS.black);
    doc.text(String(value), x + 4, y + 13);
  });

  return y + 25;
}

function buildScheduleRows(schedules) {
  return schedules.map((schedule, index) => {
    const rescheduleNote = isRescheduled(schedule)
      ? `Reschedule dari ${formatDate(schedule.tanggal)} ${formatTime(
          schedule.waktu_mulai,
        )}-${formatTime(schedule.waktu_selesai)}`
      : "-";

    return [
      index + 1,
      formatDate(getScheduleDate(schedule)),
      `${formatTime(getScheduleStartTime(schedule))} - ${formatTime(
        getScheduleEndTime(schedule),
      )}`,
      schedule.nama_kelas || schedule.nama_kelompok || "-",
      schedule.nickname_mentor || schedule.nama_mentor || "-",
      schedule.topik?.trim() || "-",
      getMeetingType(schedule),
      formatAttendanceStatus(schedule.status_absensi_mentor),
      rescheduleNote,
    ];
  });
}

function drawFooter(doc, pageWidth, pageHeight) {
  const pageNumber = doc.internal.getNumberOfPages();

  setFont(doc, "normal", 7, COLORS.lightMuted);

  doc.text(
    `Jadwal Pertemuan Wali Kelas • Halaman ${pageNumber}`,
    pageWidth / 2,
    pageHeight - 8,
    {
      align: "center",
    },
  );
}

function drawScheduleTable(doc, schedules, startY, pageWidth, pageHeight) {
  autoTable(doc, {
    startY,

    head: [
      [
        "No.",
        "Tanggal",
        "Waktu (WIB)",
        "Kelas",
        "Mentor",
        "Topik",
        "Tipe",
        "Absensi Mentor",
        "Keterangan",
      ],
    ],

    body: buildScheduleRows(schedules),

    theme: "grid",

    margin: {
      left: 14,
      right: 14,
      bottom: 16,
    },

    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 2.5,
      lineColor: COLORS.border,
      lineWidth: 0.2,
      textColor: COLORS.text,
      valign: "middle",
    },

    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      halign: "center",
    },

    alternateRowStyles: {
      fillColor: COLORS.alternateRow,
    },

    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 36 },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 30 },
      4: { cellWidth: 34 },
      5: { cellWidth: "auto" },
      6: { cellWidth: 18, halign: "center" },
      7: { cellWidth: 26, halign: "center" },
      8: { cellWidth: 40 },
    },

    didDrawPage() {
      drawFooter(doc, pageWidth, pageHeight);
    },
  });
}

function drawGeneratedAt(doc, pageHeight) {
  const generatedAt = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  setFont(doc, "normal", 7, [110, 110, 110]);

  doc.text(`Dicetak pada ${generatedAt}`, 14, pageHeight - 12);
}

function sortSchedules(schedules) {
  return [...schedules].sort((a, b) => {
    const keyA = `${getScheduleDate(a) || ""} ${getScheduleStartTime(a) || ""} ${
      a.nama_kelas || ""
    }`;
    const keyB = `${getScheduleDate(b) || ""} ${getScheduleStartTime(b) || ""} ${
      b.nama_kelas || ""
    }`;

    return keyA.localeCompare(keyB);
  });
}

// ============================================================
// EXPORT PDF
// ============================================================

/*
 * schedules : daftar jadwal flat (per kelas) dari GET /jadwal/wali-kelas
 * bulan     : "YYYY-MM"
 * className : nama kelas yang difilter, kosong = semua kelas
 */
export function exportWaliKelasSchedulePdf({
  schedules = [],
  bulan,
  className,
  meetingType,
}) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const sortedSchedules = sortSchedules(schedules);

  drawHeader(doc, pageWidth);

  let y = drawInfo(doc, { bulan, className, meetingType });

  y = drawSummary(doc, sortedSchedules, pageWidth, y);

  drawScheduleTable(doc, sortedSchedules, y, pageWidth, pageHeight);

  // Informasi cetak di halaman terakhir
  drawGeneratedAt(doc, pageHeight);

  const fileName = [
    "jadwal-wali-kelas",
    toSafeFileName(className || "semua-kelas"),
    bulan || "periode",
  ].join("-");

  doc.save(`${fileName}.pdf`);
}
