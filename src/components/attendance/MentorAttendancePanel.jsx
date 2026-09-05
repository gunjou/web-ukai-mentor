import { useEffect, useRef, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Camera,
  LogIn,
  LogOut,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";

import Card from "../ui/Card";
import Button from "../ui/Button";

import {
  formatTime,
  getScheduleStartTime,
  getScheduleEndTime,
} from "../../utils/schedule";

import { formatDateTime } from "../../utils/date";

export default function MentorAttendancePanel({
  schedule,
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
  /*
   * ==========================================
   * NO SCHEDULE
   * ==========================================
   */

  if (!schedule) {
    return (
      <Card
        className="
          flex
          min-h-[350px]
          flex-col
          items-center
          justify-center
          p-6
          text-center
        "
      >
        <CalendarDays size={32} className="text-foreground-muted" />

        <h2
          className="
            mt-3
            text-sm
            font-semibold
            text-foreground
          "
        >
          Pilih jadwal
        </h2>

        <p
          className="
            mt-1
            max-w-xs
            text-xs
            leading-relaxed
            text-foreground-muted
          "
        >
          Pilih salah satu jadwal hari ini untuk melakukan absensi.
        </p>
      </Card>
    );
  }

  /*
   * ==========================================
   * ATTENDANCE STATUS
   * ==========================================
   */

  const checkedIn = attendanceStatus === "checked-in";

  const checkedOut = attendanceStatus === "checked-out";

  const completed = attendanceStatus === "completed";

  const isOnline =
    String(schedule.type_pertemuan || "").toUpperCase() === "ONLINE";

  const isOffline = !isOnline;

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <Card className="overflow-hidden p-0">
      {/* ======================================
          HEADER
          ====================================== */}

      <div
        className="
          border-b
          border-border
          px-4
          py-4
        "
      >
        <p
          className="
            text-[11px]
            font-medium
            uppercase
            tracking-wide
            text-foreground-muted
          "
        >
          Absensi
        </p>

        <h2
          className="
            mt-1
            truncate
            text-base
            font-semibold
            text-foreground
          "
        >
          {schedule.nama_kelas || "Tanpa nama kelas"}
        </h2>

        <div
          className="
            mt-2
            flex
            items-center
            gap-2
            text-xs
            text-foreground-secondary
          "
        >
          <Clock3 size={14} />

          <span>
            {formatTime(getScheduleStartTime(schedule))} -{" "}
            {formatTime(getScheduleEndTime(schedule))}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* ====================================
            COMPLETED
            ==================================== */}

        {completed ? (
          <CompletedAttendanceState attendanceDetail={attendanceDetail} />
        ) : (
          <>
            {/* ====================================
                TIME STATUS
                ==================================== */}

            {timeStatus.status === "upcoming" && (
              <UpcomingNotice schedule={schedule} />
            )}

            {timeStatus.status === "finished" && !checkedIn && (
              <FinishedNotice />
            )}

            {/* ====================================
                LOCATION
                ==================================== */}

            {isOffline && (
              <LocationSection
                location={location}
                locationLoading={locationLoading}
                submitting={submitting}
                onGetLocation={onGetLocation}
              />
            )}

            {/* ====================================
                CAMERA / EVIDENCE
                ==================================== */}

            {isOffline && (
              <EvidenceSection
                evidence={evidence}
                submitting={submitting}
                onEvidenceChange={onEvidenceChange}
              />
            )}

            {/* ====================================
                ACTION
                ==================================== */}

            {checkedIn ? (
              <CheckOutButton
                submitting={submitting}
                location={location}
                evidence={evidence}
                isOnline={isOnline}
                canCheckOut={timeStatus.canCheckOut}
                onCheckOut={onCheckOut}
              />
            ) : (
              <CheckInButton
                submitting={submitting}
                location={location}
                evidence={evidence}
                isOnline={isOnline}
                canCheckIn={timeStatus.canCheckIn}
                onCheckIn={onCheckIn}
              />
            )}

            {/* ====================================
                HELPER
                ==================================== */}

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

/*
 * ==========================================
 * COMPLETED ATTENDANCE
 * ==========================================
 */

function CompletedAttendanceState({ attendanceDetail }) {
  return (
    <div
      className="
        rounded-xl
        border
        border-success/30
        bg-success-light
        p-4
      "
    >
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

/*
 * ==========================================
 * UPCOMING NOTICE
 * ==========================================
 */

function UpcomingNotice({ schedule }) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        rounded-xl
        border
        border-warning/30
        bg-warning-light
        p-3
      "
    >
      <Clock3
        size={17}
        className="
          mt-0.5
          shrink-0
          text-warning
        "
      />

      <div className="min-w-0">
        <p
          className="
            text-sm
            font-semibold
            text-warning
          "
        >
          Belum waktunya check-in
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-relaxed
            text-foreground-secondary
          "
        >
          Check-in dapat dilakukan mulai pukul{" "}
          <strong>{formatTime(getScheduleStartTime(schedule))}</strong>.
        </p>
      </div>
    </div>
  );
}

/*
 * ==========================================
 * FINISHED NOTICE
 * ==========================================
 */

function FinishedNotice() {
  return (
    <div
      className="
        flex
        items-start
        gap-3
        rounded-xl
        border
        border-border
        bg-background-tertiary
        p-3
      "
    >
      <AlertCircle
        size={17}
        className="
          mt-0.5
          shrink-0
          text-foreground-muted
        "
      />

      <div>
        <p
          className="
            text-sm
            font-semibold
            text-foreground
          "
        >
          Jadwal telah selesai
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-relaxed
            text-foreground-muted
          "
        >
          Check-in untuk jadwal ini sudah tidak dapat dilakukan.
        </p>
      </div>
    </div>
  );
}

/*
 * ==========================================
 * LOCATION SECTION
 * ==========================================
 */

function LocationSection({
  location,
  locationLoading,
  submitting,
  onGetLocation,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-border
        p-3
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-background-tertiary
            text-foreground-muted
          "
        >
          <MapPin size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="
              text-sm
              font-medium
              text-foreground
            "
          >
            Lokasi
          </p>

          <p
            className="
              mt-0.5
              truncate
              text-[11px]
              text-foreground-muted
            "
          >
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

/*
 * ==========================================
 * EVIDENCE SECTION
 * ==========================================
 */

function EvidenceSection({ evidence, submitting, onEvidenceChange }) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  /*
   * ==========================================
   * CREATE PREVIEW FROM EVIDENCE
   * ==========================================
   */

  useEffect(() => {
    if (!evidence) {
      setPreviewUrl(null);
      return;
    }

    if (evidence instanceof Blob) {
      const objectUrl = URL.createObjectURL(evidence);

      setPreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    if (typeof evidence === "string") {
      setPreviewUrl(evidence);
    }
  }, [evidence]);

  /*
   * ==========================================
   * STOP CAMERA
   * ==========================================
   */

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  /*
   * ==========================================
   * CLEANUP CAMERA
   * ==========================================
   */

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  /*
   * ==========================================
   * OPEN CAMERA
   * ==========================================
   */

  const openCamera = async () => {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Browser tidak mendukung akses kamera langsung.");

      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        },
        audio: false,
      });

      streamRef.current = stream;

      setCameraOpen(true);

      /*
       * Tunggu video element dirender
       */
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

  /*
   * ==========================================
   * TAKE PHOTO
   * ==========================================
   */

  const takePhoto = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

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

    /*
     * Ambil frame dari kamera
     */
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    /*
     * Convert canvas menjadi File
     */
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

        /*
         * Buat preview
         */
        const url = URL.createObjectURL(file);

        setPreviewUrl((oldUrl) => {
          if (oldUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(oldUrl);
          }

          return url;
        });

        /*
         * Kirim File ke parent.
         *
         * Karena callback lama kemungkinan
         * menerima event input file, kita
         * buat object event sederhana.
         */
        const dataTransfer = new DataTransfer();

        dataTransfer.items.add(file);

        const event = {
          target: {
            files: dataTransfer.files,
            value: file.name,
          },
        };

        onEvidenceChange(event);

        /*
         * Tutup kamera setelah foto diambil
         */
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  /*
   * ==========================================
   * CLOSE CAMERA
   * ==========================================
   */

  const handleCloseCamera = () => {
    stopCamera();
    setCameraError("");
  };

  /*
   * ==========================================
   * RENDER CAMERA
   * ==========================================
   */

  if (cameraOpen) {
    return (
      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-border
          bg-background-tertiary
        "
      >
        {/* Camera header */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-border
            px-3
            py-3
          "
        >
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-card
                text-foreground-muted
              "
            >
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
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-foreground-muted
              transition-colors
              hover:bg-card
              hover:text-foreground
            "
            aria-label="Tutup kamera"
          >
            <X size={17} />
          </button>
        </div>

        {/* Live camera */}

        <div className="relative bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="
              aspect-video
              w-full
              object-cover
            "
          />

          {/* Camera frame */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                h-[65%]
                w-[70%]
                rounded-2xl
                border-2
                border-white/70
                shadow-[0_0_0_9999px_rgba(0,0,0,0.15)]
              "
            />
          </div>

          {/* Bottom camera controls */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              flex
              justify-center
              bg-gradient-to-t
              from-black/70
              to-transparent
              px-4
              pb-5
              pt-12
            "
          >
            <button
              type="button"
              onClick={takePhoto}
              disabled={submitting}
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                border-4
                border-white
                bg-white/20
                shadow-lg
                transition-transform
                active:scale-95
                disabled:opacity-50
              "
              aria-label="Ambil foto"
            >
              <span
                className="
                  h-11
                  w-11
                  rounded-full
                  bg-white
                "
              />
            </button>
          </div>
        </div>

        {/* Camera error */}

        {cameraError && (
          <div
            className="
              border-t
              border-danger/20
              bg-danger-light
              px-3
              py-2.5
              text-xs
              leading-relaxed
              text-danger
            "
          >
            {cameraError}
          </div>
        )}
      </div>
    );
  }

  /*
   * ==========================================
   * NORMAL EVIDENCE VIEW
   * ==========================================
   */

  return (
    <div
      className="
        rounded-xl
        border
        border-border
        p-3
      "
    >
      {/* Header */}

      <div className="flex items-start gap-3">
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-background-tertiary
            text-foreground-muted
          "
        >
          <Camera size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="
              text-sm
              font-medium
              text-foreground
            "
          >
            Foto evidence
          </p>

          <p
            className="
              mt-0.5
              truncate
              text-[11px]
              text-foreground-muted
            "
          >
            {evidence?.name || "Belum mengambil foto"}
          </p>
        </div>
      </div>

      {/* ======================================
          PREVIEW
          ====================================== */}

      {previewUrl && (
        <div
          className="
            relative
            mt-3
            overflow-hidden
            rounded-xl
            border
            border-border
            bg-black
          "
        >
          <img
            src={previewUrl}
            alt="Preview foto evidence"
            className="
              aspect-video
              w-full
              object-cover
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              bg-gradient-to-t
              from-black/70
              to-transparent
              px-3
              pb-3
              pt-10
            "
          >
            <p className="text-[10px] font-medium text-white">Foto evidence</p>
          </div>
        </div>
      )}

      {/* ======================================
          CAMERA BUTTON
          ====================================== */}

      <button
        type="button"
        onClick={openCamera}
        disabled={submitting}
        className="
          mt-3
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-lg
          border
          border-border
          bg-card
          px-3
          py-2.5
          text-xs
          font-medium
          text-foreground-secondary
          transition-colors
          hover:bg-background-tertiary
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <Camera size={15} />

        {evidence ? "Ambil Ulang Foto" : "Buka Kamera"}
      </button>

      {/* ======================================
          ERROR
          ====================================== */}

      {cameraError && (
        <div
          className="
            mt-2
            rounded-lg
            border
            border-danger/20
            bg-danger-light
            px-3
            py-2
            text-[10px]
            leading-relaxed
            text-danger
          "
        >
          {cameraError}
        </div>
      )}

      {/* ======================================
          HELPER
          ====================================== */}

      <p
        className="
          mt-2
          text-center
          text-[10px]
          leading-relaxed
          text-foreground-muted
        "
      >
        Kamera akan dibuka langsung di halaman ini.
      </p>
    </div>
  );
}

/*
 * ==========================================
 * CHECK-IN BUTTON
 * ==========================================
 */

function CheckInButton({
  submitting,
  location,
  evidence,
  isOnline,
  canCheckIn,
  onCheckIn,
}) {
  const missingRequiredData = !isOnline && (!location || !evidence);

  return (
    <Button
      type="button"
      className="w-full"
      onClick={onCheckIn}
      disabled={submitting || !canCheckIn || missingRequiredData}
    >
      <LogIn size={16} />

      {submitting ? "Memproses..." : "Check-in"}
    </Button>
  );
}

/*
 * ==========================================
 * CHECK-OUT BUTTON
 * ==========================================
 */

function CheckOutButton({
  submitting,
  location,
  evidence,
  isOnline,
  canCheckOut,
  onCheckOut,
}) {
  const missingRequiredData = !isOnline && (!location || !evidence);

  return (
    <Button
      type="button"
      variant="danger"
      className="w-full"
      onClick={onCheckOut}
      disabled={submitting || !canCheckOut || missingRequiredData}
    >
      <LogOut size={16} />

      {submitting ? "Memproses..." : "Check-out"}
    </Button>
  );
}

/*
 * ==========================================
 * ATTENDANCE HELPER
 * ==========================================
 */

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
    <p
      className="
        text-center
        text-[10px]
        leading-relaxed
        text-foreground-muted
      "
    >
      {message}
    </p>
  );
}
