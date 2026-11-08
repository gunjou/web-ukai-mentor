import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Bell, CalendarDays, Clock3 } from "lucide-react";

import LoadingSpinner from "../ui/LoadingSpinner";
import { getScheduleSwaps } from "../../services/scheduleSwapService";
import { formatScheduleDate, formatTime } from "../../utils/schedule";

function getResponseData(response) {
  return response?.data ?? response;
}

export default function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const loadNotifications = useCallback(async () => {
    try {
      setError("");
      const response = await getScheduleSwaps({
        tipe: "masuk",
        status: "PENDING",
        page: 1,
        per_page: 5,
      });
      const result = getResponseData(response);
      const requestList = Array.isArray(result) ? result : [];
      setRequests(requestList);
      setCount(
        Number(response?.meta?.total ?? result?.meta?.total ?? requestList.length),
      );
    } catch (loadError) {
      console.error("Failed to load schedule swap notifications:", loadError);
      setError(loadError.message || "Notifikasi gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60000);
    const handleFocus = () => loadNotifications();

    window.addEventListener("focus", handleFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadNotifications]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function openRequest(request) {
    setOpen(false);
    navigate(`/schedule-swaps?request=${encodeURIComponent(request.id_request)}`);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          loadNotifications();
        }}
        className="
          relative flex h-9 w-9 items-center justify-center rounded-lg
          text-foreground-secondary transition-colors hover:bg-background-tertiary
          hover:text-foreground focus:outline-none focus:ring-2
          focus:ring-primary-500/20
        "
        aria-label={
          count > 0
            ? `${count} request tukar jadwal menunggu`
            : "Notifikasi"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell size={19} />
        {count > 0 && (
          <span
            className="
              absolute right-1 top-1 flex h-4 min-w-4 items-center
              justify-center rounded-full bg-danger px-1 text-[9px]
              font-bold text-white
            "
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Notifikasi request tukar jadwal"
          className="
            absolute right-0 top-full z-[100] mt-2 w-[min(22rem,calc(100vw-2rem))]
            overflow-hidden rounded-xl border border-border bg-card shadow-xl
          "
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Notifikasi
              </h2>
              <p className="mt-0.5 text-[11px] text-foreground-muted">
                Request tukar jadwal yang menunggu respon
              </p>
            </div>
            {count > 0 && (
              <span className="rounded-full bg-danger/10 px-2 py-1 text-[10px] font-semibold text-danger">
                {count} menunggu
              </span>
            )}
          </div>

          {loading && requests.length === 0 ? (
            <div className="flex min-h-28 items-center justify-center">
              <LoadingSpinner label="Memuat notifikasi..." />
            </div>
          ) : error && requests.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <p className="text-xs text-danger">{error}</p>
              <button
                type="button"
                onClick={loadNotifications}
                className="mt-2 text-xs font-semibold text-primary-600 hover:underline"
              >
                Coba lagi
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="px-4 py-7 text-center">
              <Bell
                size={20}
                className="mx-auto text-foreground-muted"
                aria-hidden="true"
              />
              <p className="mt-2 text-xs font-medium text-foreground">
                Tidak ada request baru
              </p>
              <p className="mt-1 text-[11px] text-foreground-muted">
                Semua request masuk sudah ditangani.
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto p-2">
              {requests.map((request) => (
                <button
                  type="button"
                  key={request.id_request}
                  onClick={() => openRequest(request)}
                  className="
                    w-full rounded-lg px-3 py-3 text-left transition-colors
                    hover:bg-background-tertiary focus:outline-none
                    focus:ring-2 focus:ring-primary-500/20
                  "
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0 truncate text-xs font-semibold text-foreground">
                      {request.mentor_pengaju?.nama || "Mentor"} mengajukan
                      tukar jadwal
                    </span>
                    <ArrowRight
                      size={14}
                      className="mt-0.5 shrink-0 text-foreground-muted"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-foreground-muted">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={12} />
                      {formatScheduleDate(request.grup_asal?.tanggal)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={12} />
                      {formatTime(request.grup_asal?.waktu_mulai)} WIB
                    </span>
                  </div>
                  {request.alasan && (
                    <p className="mt-2 line-clamp-2 text-[11px] text-foreground-secondary">
                      {request.alasan}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/schedule-swaps");
            }}
            className="
              flex w-full items-center justify-center gap-2 border-t
              border-border px-4 py-3 text-xs font-semibold text-primary-600
              transition-colors hover:bg-background-tertiary
            "
          >
            Lihat semua request
            <ArrowRight size={14} />
          </button>
        </section>
      )}
    </div>
  );
}
