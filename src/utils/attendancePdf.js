import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  success: [22, 128, 70],
  warning: [180, 120, 0],
  danger: [190, 40, 40],
};

const STATUS_LABELS = {
  HADIR: "Hadir",
  IZIN: "Izin",
  SAKIT: "Sakit",
  ALPHA: "Alpha",
};

const STATUS_COLORS = {
  Hadir: COLORS.success,
  Izin: COLORS.warning,
  Sakit: COLORS.primary,
  Alpha: COLORS.danger,
};

// ============================================================
// FORMATTERS
// ============================================================

function formatDate(date) {
  if (!date) return "-";

  const value = new Date(`${date}T00:00:00`);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "-";

  return String(time).slice(0, 5);
}

function formatCheckIn(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDatePart(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getTimePart(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || "-";
}

// ============================================================
// SCHEDULE HELPERS
// ============================================================

function getEffectiveDate(schedule) {
  return schedule?.tanggal_efektif || schedule?.tanggal || null;
}

function getEffectiveStartTime(schedule) {
  return schedule?.waktu_mulai_efektif || schedule?.waktu_mulai || null;
}

function getEffectiveEndTime(schedule) {
  return schedule?.waktu_selesai_efektif || schedule?.waktu_selesai || null;
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
    }
  );

  doc.setLineWidth(0.3);
  doc.setDrawColor(...COLORS.primary);
  doc.line(14, 20, pageWidth - 14, 20);
}

function drawSectionTitle(doc, title, x, y) {
  setFont(doc, "bold", 10, COLORS.black);
  doc.text(title, x, y);
}

function drawScheduleInfo(doc, schedule, effectiveDate, startTime, endTime) {
  let y = 30;

  drawSectionTitle(doc, "INFORMASI JADWAL", 14, y);

  y += 7;

  const rows = [
    [
      "Kelas",
      schedule.nama_kelas || "-",
      "Mentor",
      schedule.nickname_mentor || schedule.nama_mentor || "-",
    ],
    [
      "Tanggal",
      formatDate(effectiveDate),
      "Jenis Pertemuan",
      schedule.type_pertemuan || "-",
    ],
    [
      "Waktu",
      `${formatTime(startTime)} - ${formatTime(endTime)}`,
      "ID Jadwal",
      String(schedule.id_jadwal || "-"),
    ],
  ];

  rows.forEach(([label1, value1, label2, value2]) => {
    setFont(doc, "bold", 9, COLORS.black);
    doc.text(label1, 14, y);

    setFont(doc, "normal", 9, COLORS.text);
    doc.text(value1, 42, y);

    setFont(doc, "bold", 9, COLORS.black);
    doc.text(label2, 110, y);

    setFont(doc, "normal", 9, COLORS.text);
    doc.text(value2, 145, y);

    y += 6;
  });

  return y;
}

function drawSummary(doc, meta, pageWidth, y) {
  y += 4;

  drawSectionTitle(doc, "RINGKASAN KEHADIRAN", 14, y);

  y += 6;

  const summary = [
    ["Total Peserta", Number(meta.total || 0)],
    ["Hadir", Number(meta.hadir || 0)],
    ["Izin", Number(meta.izin || 0)],
    ["Sakit", Number(meta.sakit || 0)],
    ["Alpha", Number(meta.alpha || 0)],
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

function buildAttendanceRows(participants) {
  return participants.map((participant, index) => [
    index + 1,
    participant.nickname || participant.nama || "-",
    getStatusLabel(participant.status_kehadiran),
    getDatePart(participant.check_in_at) || "-",
    getTimePart(participant.check_in_at) || "-",
    participant.location_accuracy != null
      ? `${Number(participant.location_accuracy).toFixed(2)} m`
      : "-",
  ]);
}

function drawAttendanceTable(doc, participants, startY, pageWidth, pageHeight) {
  const rows = buildAttendanceRows(participants);

  autoTable(doc, {
    startY,

    head: [["No.", "Nama Peserta", "Status", "Tanggal", "Pukul", "Accuracy"]],

    body: rows,

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
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
      0: {
        cellWidth: 12,
        halign: "center",
      },
      1: {
        cellWidth: 55,
      },
      2: {
        cellWidth: 25,
        halign: "center",
      },
      3: {
        cellWidth: 30,
        halign: "center",
      },
      4: {
        cellWidth: 25,
        halign: "center",
      },
      5: {
        cellWidth: 30,
        halign: "center",
      },
    },

    didParseCell(data) {
      if (data.section !== "body" || data.column.index !== 2) {
        return;
      }

      const status = data.cell.raw;
      const color = STATUS_COLORS[status];

      if (!color) return;

      data.cell.styles.textColor = color;
      data.cell.styles.fontStyle = "bold";
    },

    didDrawPage() {
      drawFooter(doc, pageWidth, pageHeight);
    },
  });

  return doc.lastAutoTable?.finalY || startY;
}

function drawFooter(doc, pageWidth, pageHeight) {
  const pageNumber = doc.internal.getNumberOfPages();

  setFont(doc, "normal", 7, COLORS.lightMuted);

  doc.text(
    `Laporan Kehadiran Peserta • Halaman ${pageNumber}`,
    pageWidth / 2,
    pageHeight - 10,
    {
      align: "center",
    }
  );
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

  doc.text(`Dicetak pada ${generatedAt}`, 14, pageHeight - 15);
}

function createFileName(schedule, effectiveDate) {
  const safeClassName = (schedule.nama_kelas || "kelas")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const safeDate = effectiveDate || "tanggal";

  return `laporan-kehadiran-${safeClassName}-${safeDate}.pdf`;
}

// ============================================================
// EXPORT PDF
// ============================================================

export function exportAttendancePdf({
  schedule,
  participants = [],
  meta = {},
}) {
  if (!schedule) {
    throw new Error("Jadwal belum dipilih.");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const effectiveDate = getEffectiveDate(schedule);
  const startTime = getEffectiveStartTime(schedule);
  const endTime = getEffectiveEndTime(schedule);

  // Header
  drawHeader(doc, pageWidth);

  // Informasi jadwal
  let y = drawScheduleInfo(doc, schedule, effectiveDate, startTime, endTime);

  // Ringkasan
  y = drawSummary(doc, meta, pageWidth, y);

  // Tabel kehadiran
  drawAttendanceTable(doc, participants, y, pageWidth, pageHeight);

  // Informasi cetak
  drawGeneratedAt(doc, pageHeight);

  // Simpan file
  const fileName = createFileName(schedule, effectiveDate);

  doc.save(fileName);
}
