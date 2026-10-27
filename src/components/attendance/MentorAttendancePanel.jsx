import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  MapPin,
  RefreshCw,
  X,
} from "lucide-react";

import Card from "../ui/Card";
import Button from "../ui/Button";
import {
  formatTime,
  getScheduleEndTime,
  getScheduleStartTime,
} from "../../utils/schedule";
import { formatDateTime } from "../../utils/date";

const MINIMUM_TEACHING_DURATION = 2 * 60 * 60 * 1000;
const WIB_TIME_ZONE = "Asia/Jakarta";

function parseWibDateTime(value) {
  if (!value) return null;

  // Timestamp tanpa zona waktu dianggap sebagai waktu WIB.
  const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const normalizedValue = hasTimeZone ? value : `${value}+07:00`;
  const timestamp = new Date(normalizedValue).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

function formatWibTime(dateTime) {
  if (!dateTime) return null;

  const date = new Date(
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(dateTime) ? dateTime : `${dateTime}+07:00`
  );

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function getWibNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const time = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return new Date(
    `${time.year}-${time.month}-${time.day}T${time.hour}:${time.minute}:${time.second}+07:00`
  ).getTime();
}

function getCheckOutAvailability(attendanceDetail) {
  const checkInTime = parseWibDateTime(attendanceDetail?.check_in_at);
  const scheduleDate = attendanceDetail?.tanggal;
  const scheduleEndTime = attendanceDetail?.waktu_selesai;

  if (!checkInTime || !scheduleDate || !scheduleEndTime) {
    return {
      available: false,
      remainingMs: null,
      earliestCheckOut: null,
    };
  }

  const scheduleEnd = parseWibDateTime(`${scheduleDate}T${scheduleEndTime}`);

  if (scheduleEnd === null) {
    return {
      available: false,
      remainingMs: null,
      earliestCheckOut: null,
    };
  }

  // Checkout bisa setelah 2 jam mengajar ATAU saat jadwal selesai,
  // tergantung mana yang tercapai lebih dahulu.
  const earliestCheckOut = Math.min(
    checkInTime + MINIMUM_TEACHING_DURATION,
    scheduleEnd
  );

  const remainingMs = Math.max(0, earliestCheckOut - getWibNow());

  return {
    available: remainingMs === 0,
    remainingMs,
    earliestCheckOut,
  };
}

export default function MentorAttendancePanel({
  schedule,
  schedules = [],
  timeStatus,
  location,
  locationLoading,
  evidence,
  submitting,
  attendanceStatus,
  attendanceDetail,
  attendanceLoading,
  onGetLocation,
  onEvidenceChange,
  onCheckIn,
  onCheckOut,
}) {
  if (!schedule) {
    return (
      <Card className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
        <CalendarDays size={32} className="text-foreground-muted" />
        <h2 className="mt-3 text-sm font-semibold text-foreground">
          Pilih jadwal
        </h2>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-foreground-muted">
          Pilih salah satu jadwal hari ini untuk melakukan absensi.
        </p>
      </Card>
    );
  }

  const checkOutTime = formatWibTime(attendanceDetail?.check_out_at);
  const checkInTime = formatWibTime(attendanceDetail?.check_in_at);
  const selectedSchedules =
    schedules.length > 0 ? schedules : schedule ? [schedule] : [];

  const hasCheckedIn = Boolean(attendanceDetail?.check_in_at);
  const hasCheckedOut = Boolean(attendanceDetail?.check_out_at);

  // Data absensi dari server menjadi fallback jika status belum sinkron.
  const checkedIn =
    attendanceStatus === "checked-in" || (hasCheckedIn && !hasCheckedOut);

  const completed = attendanceStatus === "completed" || hasCheckedOut;

  const isOnline =
    String(schedule.type_pertemuan || "").toUpperCase() === "ONLINE";

  const isOffline = !isOnline;

  const checkoutDetail = {
    ...schedule,
    ...attendanceDetail,
  };

  // console.log("ini attende", attendanceDetail);

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border px-4 py-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
          Absensi
        </p>

        <div className="flex items-center gap-2">
          <h2 className="min-w-0 truncate text-base font-semibold text-foreground">
            {schedule.nama_kelas || schedule.nama_kelompok || "-"}
          </h2>

          {schedules.length > 1 && (
            <span className="shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
              {schedules.length} jadwal
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-foreground-secondary">
          <Clock3 size={14} />
          <span>
            {formatTime(getScheduleStartTime(schedule))} -{" "}
            {formatTime(getScheduleEndTime(schedule))} WIB
          </span>
        </div>

        {schedules.length > 1 && <GroupedScheduleInfo schedules={schedules} />}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          {/* {checkInTime ? ( */}
          {checkInTime && checkOutTime == null ? (
            <div className="flex items-center gap-1.5 text-green-700">
              <span className="font-medium">Check-in:</span>
              <span>{checkInTime} WIB</span>
            </div>
          ) : (
            <span className="text-gray-500"></span>
          )}

          {/* {checkOutTime && (
            <div className="flex items-center gap-1.5 text-blue-700">
              <span className="font-medium">Check-out:</span>
              <span>{checkOutTime} WIB</span>
            </div>
          )} */}
        </div>
      </div>

      <div className="space-y-4 p-4">
        {completed ? (
          <CompletedAttendanceState attendanceDetail={attendanceDetail} />
        ) : (
          <>
            {timeStatus.status === "upcoming" && (
              <UpcomingNotice schedule={schedule} />
            )}
            {timeStatus.status === "finished" && !checkedIn && (
              <FinishedNotice />
            )}

            {isOffline && (
              <LocationSection
                location={location}
                locationLoading={locationLoading}
                submitting={submitting}
                onGetLocation={onGetLocation}
              />
            )}

            {isOffline && (
              <EvidenceSection
                evidence={evidence}
                submitting={submitting}
                onEvidenceChange={onEvidenceChange}
              />
            )}

            {checkedIn ? (
              <CheckOutButton
                submitting={submitting}
                location={location}
                evidence={evidence}
                isOnline={isOnline}
                schedules={selectedSchedules}
                attendanceDetail={checkoutDetail}
                onCheckOut={() => onCheckOut(selectedSchedules)}
              />
            ) : (
              <CheckInButton
                submitting={submitting}
                location={location}
                evidence={evidence}
                isOnline={isOnline}
                canCheckIn={timeStatus.canCheckIn}
                schedules={selectedSchedules}
                onCheckIn={() => onCheckIn(selectedSchedules)}
              />
            )}

            <AttendanceHelper
              location={location}
              evidence={evidence}
              timeStatus={timeStatus}
              checkedIn={checkedIn}
              isOnline={isOnline}
            />
          </>
        )}
      </div>
    </Card>
  );
}

/* Informasi jadwal kolektif */
function GroupedScheduleInfo({ schedules }) {
  return (
    <div className="mt-3 rounded-xl border border-primary/20 bg-primary-50 p-3 dark:bg-primary-900/10">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
        Absensi kolektif
      </p>

      <p className="mt-1 text-[11px] leading-relaxed text-foreground-secondary">
        Absensi akan diterapkan ke seluruh jadwal dalam group ini.
      </p>

      <div className="mt-2 space-y-1">
        {schedules.map((item) => (
          <div
            key={item.id_jadwal}
            className="flex items-center gap-2 text-xs text-foreground"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span className="min-w-0 truncate">
              {item.nama_kelas || "Tanpa nama kelas"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Status absensi selesai */
function CompletedAttendanceState({ attendanceDetail }) {
  return (
    <div className="rounded-xl border border-success/30 bg-success-light p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-success" />

        <div className="min-w-0">
          <p className="text-sm font-semibold text-success">Absensi selesai</p>
          <p className="mt-0.5 text-xs text-foreground-secondary">
            Check-in dan check-out untuk jadwal ini sudah selesai.
          </p>

          {attendanceDetail?.check_in_at && (
            <div className="mt-3 text-xs text-success">
              <span className="font-medium">Check-in:</span>{" "}
              {formatDateTime(attendanceDetail.check_in_at)}
            </div>
          )}

          {attendanceDetail?.check_out_at && (
            <div className="mt-1 text-xs text-primary">
              <span className="font-medium">Check-out:</span>{" "}
              {formatDateTime(attendanceDetail.check_out_at)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Informasi jadwal belum dimulai */
function UpcomingNotice({ schedule }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-light p-3">
      <Clock3 size={17} className="mt-0.5 shrink-0 text-warning" />

      <div className="min-w-0">
        <p className="text-sm font-semibold text-warning">
          Belum waktunya check-in
        </p>
        <p className="mt-1 text-xs leading-relaxed text-foreground-secondary">
          Check-in dapat dilakukan mulai pukul{" "}
          <strong>{formatTime(getScheduleStartTime(schedule))}</strong>.
        </p>
      </div>
    </div>
  );
}

/* Informasi jadwal selesai */
function FinishedNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background-tertiary p-3">
      <AlertCircle
        size={17}
        className="mt-0.5 shrink-0 text-foreground-muted"
      />

      <div>
        <p className="text-sm font-semibold text-foreground">
          Jadwal telah selesai
        </p>
        <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
          Check-in untuk jadwal ini sudah tidak dapat dilakukan.
        </p>
      </div>
    </div>
  );
}

/* Pengambilan lokasi */
function LocationSection({
  location,
  locationLoading,
  submitting,
  onGetLocation,
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background-tertiary text-foreground-muted">
          <MapPin size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Lokasi</p>
          <p className="mt-0.5 truncate text-[11px] text-foreground-muted">
            {location
              ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(
                  6
                )}`
              : "Lokasi belum diambil"}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onGetLocation}
          disabled={locationLoading || submitting}
        >
          {locationLoading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <MapPin size={14} />
          )}
          {location ? "Perbarui" : "Ambil"}
        </Button>
      </div>
    </div>
  );
}

/* Kamera dan foto evidence */
function EvidenceSection({ evidence, submitting, onEvidenceChange }) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!evidence) {
      setPreviewUrl(null);
      return;
    }

    if (evidence instanceof Blob) {
      const objectUrl = URL.createObjectURL(evidence);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }

    if (typeof evidence === "string") {
      setPreviewUrl(evidence);
    }
  }, [evidence]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const openCamera = async () => {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Browser tidak mendukung akses kamera langsung.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (error) {
      console.error("Camera error:", error);

      if (error?.name === "NotAllowedError") {
        setCameraError(
          "Akses kamera ditolak. Izinkan kamera pada browser untuk melanjutkan."
        );
      } else if (error?.name === "NotFoundError") {
        setCameraError("Kamera tidak ditemukan pada perangkat ini.");
      } else if (error?.name === "NotReadableError") {
        setCameraError("Kamera sedang digunakan aplikasi lain.");
      } else {
        setCameraError(
          "Tidak dapat membuka kamera. Pastikan browser memiliki izin kamera."
        );
      }
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Kamera belum siap. Silakan tunggu sebentar.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Tidak dapat mengambil gambar dari kamera.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Gagal membuat file foto.");
          return;
        }

        const file = new File([blob], `attendance-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        const url = URL.createObjectURL(file);

        setPreviewUrl((oldUrl) => {
          if (oldUrl?.startsWith("blob:")) URL.revokeObjectURL(oldUrl);
          return url;
        });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        onEvidenceChange({
          target: {
            files: dataTransfer.files,
            value: file.name,
          },
        });

        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  const handleCloseCamera = () => {
    stopCamera();
    setCameraError("");
  };

  if (cameraOpen) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-background-tertiary">
        <div className="flex items-center justify-between border-b border-border px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-foreground-muted">
              <Camera size={16} />
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">Kamera</p>
              <p className="text-[10px] text-foreground-muted">
                Arahkan kamera ke objek evidence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseCamera}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-card hover:text-foreground"
            aria-label="Tutup kamera"
          >
            <X size={17} />
          </button>
        </div>

        <div className="relative bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="aspect-video w-full object-cover"
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[65%] w-[70%] rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.15)]" />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/70 to-transparent px-4 pb-5 pt-12">
            <button
              type="button"
              onClick={takePhoto}
              disabled={submitting}
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              aria-label="Ambil foto"
            >
              <span className="h-11 w-11 rounded-full bg-white" />
            </button>
          </div>
        </div>

        {cameraError && (
          <div className="border-t border-danger/20 bg-danger-light px-3 py-2.5 text-xs leading-relaxed text-danger">
            {cameraError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background-tertiary text-foreground-muted">
          <Camera size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Foto evidence</p>
          <p className="mt-0.5 truncate text-[11px] text-foreground-muted">
            {evidence?.name || "Belum mengambil foto"}
          </p>
        </div>
      </div>

      {previewUrl && (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-border bg-black">
          <img
            src={previewUrl}
            alt="Preview foto evidence"
            className="aspect-video w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10">
            <p className="text-[10px] font-medium text-white">Foto evidence</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={openCamera}
        disabled={submitting}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-xs font-medium text-foreground-secondary transition-colors hover:bg-background-tertiary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Camera size={15} />
        {evidence ? "Ambil Ulang Foto" : "Buka Kamera"}
      </button>

      {cameraError && (
        <div className="mt-2 rounded-lg border border-danger/20 bg-danger-light px-3 py-2 text-[10px] leading-relaxed text-danger">
          {cameraError}
        </div>
      )}

      <p className="mt-2 text-center text-[10px] leading-relaxed text-foreground-muted">
        Kamera akan dibuka langsung di halaman ini.
      </p>
    </div>
  );
}

/* Tombol check-in */
function CheckInButton({
  submitting,
  location,
  evidence,
  isOnline,
  canCheckIn,
  schedules = [],
  onCheckIn,
}) {
  const missingRequiredData = !isOnline && (!location || !evidence);
  const label =
    schedules.length > 1 ? `Check-in ${schedules.length} Jadwal` : "Check-in";

  return (
    <Button
      type="button"
      className="w-full"
      onClick={onCheckIn}
      disabled={submitting || !canCheckIn || missingRequiredData}
    >
      <LogIn size={16} />
      {submitting ? "Memproses..." : label}
    </Button>
  );
}

/* Tombol check-out */
function CheckOutButton({
  submitting,
  location,
  evidence,
  isOnline,
  canCheckOut,
  schedules = [],
  attendanceDetail,
  onCheckOut,
}) {
  const { available, remainingMs } = getCheckOutAvailability(attendanceDetail);

  const missingRequiredData = !isOnline && (!location || !evidence);

  const label =
    schedules.length > 1 ? `Check-out ${schedules.length} Jadwal` : "Check-out";

  // Pertahankan validasi jadwal lama, tetapi jangan biarkan
  // status waktu jadwal menghalangi checkout setelah batas waktu terpenuhi.
  const isEnabled = available && !submitting && !missingRequiredData;

  const remainingMinutes =
    remainingMs === null ? null : Math.ceil(remainingMs / 60000);

  const statusMessage =
    remainingMs === null
      ? "Waktu checkout belum dapat ditentukan"
      : available
      ? "Anda sudah bisa checkout"
      : `Anda bisa checkout ${remainingMinutes} menit lagi`;

  const handleCheckOut = () => {
    if (!isEnabled) return;

    // Tetap gunakan handler lama agar proses pemilihan jadwal
    // dan pengiriman data checkout tidak berubah.
    onCheckOut();
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="danger"
        className="w-full"
        onClick={handleCheckOut}
        disabled={!isEnabled}
      >
        <LogOut size={16} />
        {submitting ? "Memproses..." : label}
      </Button>

      {!submitting && (
        <p
          className={`text-sm ${
            available ? "text-green-600" : "text-amber-600"
          }`}
          role="status"
        >
          {statusMessage}
        </p>
      )}

      {missingRequiredData && (
        <p className="text-sm text-red-600">
          Lengkapi lokasi dan bukti mengajar sebelum checkout.
        </p>
      )}

      {schedules.length === 0 && (
        <p className="text-sm text-red-600">
          Tidak ada jadwal yang dipilih untuk checkout.
        </p>
      )}
    </div>
  );
}

/* Pesan bantuan absensi */
function AttendanceHelper({
  location,
  evidence,
  timeStatus,
  checkedIn,
  isOnline,
}) {
  let message;

  if (timeStatus.status === "upcoming") {
    message = "Tombol check-in aktif saat jadwal dimulai.";
  } else if (checkedIn) {
    message = isOnline
      ? "Anda sudah check-in. Lakukan check-out setelah selesai mengajar."
      : "Anda sudah check-in. Pastikan lokasi dan foto tersedia untuk check-out.";
  } else if (!isOnline && !location) {
    message = "Ambil lokasi terlebih dahulu.";
  } else if (!isOnline && !evidence) {
    message = "Ambil foto evidence terlebih dahulu.";
  } else if (isOnline) {
    message =
      "Lokasi dan foto evidence bersifat opsional untuk pertemuan online.";
  } else {
    message = "Semua data siap untuk melakukan absensi.";
  }

  return (
    <p className="text-center text-[10px] leading-relaxed text-foreground-muted">
      {message}
    </p>
  );
}
