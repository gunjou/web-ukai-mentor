import { ArrowLeftRight, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import AppPageHeader from "../components/ui/AppPageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Select from "../components/ui/Select";
import {
  ScheduleSwapCreateModal,
  ScheduleSwapDetailModal,
} from "../components/schedule/ScheduleSwapModals";
import { useToast } from "../context/ToastContext";
import {
  createScheduleSwap,
  getScheduleSwapCandidates,
  getScheduleSwapDetail,
  getScheduleSwaps,
  respondToScheduleSwap,
} from "../services/scheduleSwapService";
import { getSchedulesGroup } from "../services/scheduleService";
import { formatScheduleDate, formatTime } from "../utils/schedule";

const STATUS_OPTIONS = [
  ["", "Semua status"],
  ["PENDING", "Menunggu"],
  ["DITERIMA", "Diterima"],
  ["DITOLAK", "Ditolak"],
  ["DIBATALKAN", "Dibatalkan"],
  ["KADALUARSA", "Kedaluwarsa"],
];

const STATUS_STYLES = {
  PENDING: "bg-warning/10 text-warning",
  DITERIMA: "bg-success/10 text-success",
  DITOLAK: "bg-danger/10 text-danger",
  DIBATALKAN: "bg-background-tertiary text-foreground-muted",
  KADALUARSA: "bg-background-tertiary text-foreground-muted",
};

const STATUS_LABELS = {
  PENDING: "Menunggu",
  DITERIMA: "Diterima",
  DITOLAK: "Ditolak",
  DIBATALKAN: "Dibatalkan",
  KADALUARSA: "Kedaluwarsa",
};

function getResponseData(response) {
  return response?.data ?? response;
}

function normalizeGroups(response) {
  const result = getResponseData(response);
  const groups = Array.isArray(result)
    ? result
    : Array.isArray(result?.data)
    ? result.data
    : [];

  return groups
    .map((group) => {
      const schedules = Array.isArray(group?.classes)
        ? group.classes
        : Array.isArray(group?.jadwal)
        ? group.jadwal
        : [];
      const idJadwal = group?.id_jadwal || schedules[0]?.id_jadwal;

      if (!idJadwal) {
        return null;
      }

      return {
        id_jadwal: idJadwal,
        tanggal:
          group?.tanggal_efektif ||
          group?.tanggal ||
          schedules[0]?.tanggal_efektif ||
          schedules[0]?.tanggal,
        waktu_mulai:
          group?.waktu_mulai_efektif ||
          group?.waktu_mulai ||
          schedules[0]?.waktu_mulai_efektif ||
          schedules[0]?.waktu_mulai,
        waktu_selesai:
          group?.waktu_selesai_efektif ||
          group?.waktu_selesai ||
          schedules[0]?.waktu_selesai_efektif ||
          schedules[0]?.waktu_selesai,
        total_jadwal: schedules.length || group?.total_jadwal || 1,
        jadwal: schedules,
      };
    })
    .filter(Boolean);
}

function RequestCard({ request, onOpen }) {
  const status = request.status || "PENDING";
  const statusLabel = STATUS_LABELS[status] || status;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary-500/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">
            {request.arah === "masuk" ? "Request masuk" : "Request saya"}
            {/* <span className="ml-2 text-[11px] font-normal text-foreground-muted">
              #{request.id_request}
            </span> */}
          </p>
          <p className="mt-1 text-sm text-foreground-secondary">
            {request.arah === "masuk"
              ? request.mentor_pengaju?.nama || "Mentor"
              : request.mentor_tujuan?.nama || "Mentor"}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            STATUS_STYLES[status] || STATUS_STYLES.KADALUARSA
          }`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-foreground-muted sm:grid-cols-2">
        <span>
          Asal: {formatScheduleDate(request.grup_asal?.tanggal)} ·{" "}
          {formatTime(request.grup_asal?.waktu_mulai)}
        </span>
        <span>
          Tujuan: {formatScheduleDate(request.grup_tujuan?.tanggal)} ·{" "}
          {formatTime(request.grup_tujuan?.waktu_mulai)}
        </span>
      </div>
      {request.alasan && (
        <p className="mt-3 line-clamp-2 text-xs text-foreground-secondary">
          {request.alasan}
        </p>
      )}
    </button>
  );
}

export default function ScheduleSwapPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [groups, setGroups] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestType, setRequestType] = useState("masuk");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [responseNote, setResponseNote] = useState("");
  const [responding, setResponding] = useState(false);
  const notificationRequestId = searchParams.get("request");

  const loadGroups = useCallback(async () => {
    const response = await getSchedulesGroup();
    setGroups(normalizeGroups(response));
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setRequestsError("");
      const response = await getScheduleSwaps({
        tipe: requestType,
        status: statusFilter,
        page,
        per_page: 20,
      });
      const result = getResponseData(response);
      setRequests(Array.isArray(result) ? result : []);
      setMeta(response?.meta || result?.meta || null);
    } catch (error) {
      console.error("Failed to load schedule swap requests:", error);
      setRequestsError(error.message || "Gagal memuat request tukar jadwal.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [page, requestType, statusFilter]);

  const refresh = useCallback(async () => {
    try {
      await Promise.all([loadGroups(), loadRequests()]);
    } catch (error) {
      console.error("Failed to refresh schedule swap data:", error);
      toast.error(error.message || "Gagal memperbarui data tukar jadwal.");
    }
  }, [loadGroups, loadRequests, toast]);

  useEffect(() => {
    loadGroups().catch((error) => {
      console.error("Failed to load mentor schedules:", error);
      toast.error(error.message || "Gagal memuat jadwal.");
    });
  }, [loadGroups, toast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const sourceGroup = useMemo(
    () => groups.find((group) => String(group.id_jadwal) === selectedGroupId),
    [groups, selectedGroupId]
  );

  const filteredCandidates = useMemo(() => {
    const search = candidateSearch.trim().toLocaleLowerCase("id");
    if (!search) {
      return candidates;
    }

    return candidates.filter((candidate) => {
      const searchableText = [
        candidate.nama_mentor,
        ...(candidate.jadwal || []).flatMap((schedule) => [
          schedule.nama_kelas,
          schedule.nama_kelompok,
          schedule.topik,
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("id");

      return searchableText.includes(search);
    });
  }, [candidateSearch, candidates]);

  async function loadCandidates(idJadwal) {
    setSelectedGroupId(idJadwal);
    setSelectedCandidate(null);
    setCandidates([]);
    setCandidateSearch("");

    if (!idJadwal) {
      return;
    }

    try {
      setCandidateLoading(true);
      const response = await getScheduleSwapCandidates({
        id_jadwal: idJadwal,
      });
      const result = getResponseData(response);
      setCandidates(Array.isArray(result?.kandidat) ? result.kandidat : []);
    } catch (error) {
      console.error("Failed to load schedule swap candidates:", error);
      toast.error(error.message || "Gagal memuat kandidat tukar jadwal.");
    } finally {
      setCandidateLoading(false);
    }
  }

  function openCreateModal() {
    setCreateOpen(true);
    setSelectedGroupId("");
    setCandidates([]);
    setSelectedCandidate(null);
    setReason("");
  }

  async function submitRequest(event) {
    event.preventDefault();
    if (!sourceGroup || !selectedCandidate) {
      toast.error("Pilih jadwal asal dan kandidat terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);
      await createScheduleSwap({
        id_jadwal_asal: Number(sourceGroup.id_jadwal),
        id_jadwal_tujuan: Number(
          selectedCandidate.id_jadwal_list?.[0] || selectedCandidate.id_jadwal
        ),
        alasan: reason.trim(),
      });
      toast.success("Request tukar jadwal berhasil dikirim.");
      setCreateOpen(false);
      setRequestType("keluar");
      setStatusFilter("PENDING");
      setPage(1);
      await loadGroups();
    } catch (error) {
      console.error("Failed to create schedule swap request:", error);
      toast.error(error.message || "Gagal mengirim request tukar jadwal.");
    } finally {
      setSubmitting(false);
    }
  }

  const openDetail = useCallback(
    async (request) => {
      setDetailLoading(true);
      setDetail(null);
      setResponseNote("");
      try {
        const response = await getScheduleSwapDetail(request.id_request);
        setDetail(getResponseData(response));
      } catch (error) {
        console.error("Failed to load schedule swap detail:", error);
        toast.error(error.message || "Gagal memuat detail request.");
      } finally {
        setDetailLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!notificationRequestId) {
      return;
    }

    setSearchParams(
      (params) => {
        params.delete("request");
        return params;
      },
      { replace: true }
    );
    openDetail({ id_request: notificationRequestId });
  }, [notificationRequestId, openDetail, setSearchParams]);

  async function respond(action) {
    if (!detail) {
      return;
    }
    try {
      setResponding(true);
      await respondToScheduleSwap(
        detail.id_request,
        action,
        action === "batal" ? undefined : { catatan_respon: responseNote.trim() }
      );
      toast.success(
        action === "terima"
          ? "Tukar jadwal berhasil."
          : action === "tolak"
          ? "Request tukar jadwal ditolak."
          : "Request tukar jadwal dibatalkan."
      );
      setDetail(null);
      await Promise.all([loadRequests(), loadGroups()]);
    } catch (error) {
      console.error("Failed to respond to schedule swap request:", error);
      toast.error(error.message || "Gagal memproses request tukar jadwal.");
      if (error.status === 409) {
        await loadRequests();
        try {
          const response = await getScheduleSwapDetail(detail.id_request);
          setDetail(getResponseData(response));
        } catch (refreshError) {
          console.error(
            "Failed to refresh expired schedule swap:",
            refreshError
          );
          setDetail(null);
        }
      }
    } finally {
      setResponding(false);
    }
  }

  const isPending = detail?.status === "PENDING";
  const canRespond = isPending && detail?.arah === "masuk";
  const canCancel = isPending && detail?.arah === "keluar";

  return (
    <div className="space-y-5">
      <AppPageHeader
        title="Tukar Jadwal"
        description="Ajukan pertukaran satu grup jadwal dengan mentor lain, atau tanggapi request yang masuk."
        action={
          <div className="flex w-full gap-2 sm:w-auto">
            <Button variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button onClick={openCreateModal}>
              <ArrowLeftRight size={15} />
              Ajukan tukar
            </Button>
          </div>
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="flex w-full gap-1 overflow-x-auto sm:w-auto">
            {[
              ["masuk", "Request masuk"],
              ["keluar", "Request saya"],
              ["semua", "Semua"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setRequestType(value);
                  setPage(1);
                }}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  requestType === value
                    ? "bg-primary-500 text-white"
                    : "text-foreground-secondary hover:bg-background-tertiary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter status request"
            >
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value || "all"} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <LoadingSpinner size="lg" label="Memuat request tukar jadwal..." />
          </div>
        ) : requestsError ? (
          <EmptyState
            title="Gagal memuat request"
            description={requestsError}
            actionLabel="Coba lagi"
            onAction={loadRequests}
          />
        ) : requests.length === 0 ? (
          <EmptyState
            title="Belum ada request"
            description="Request tukar jadwal akan muncul di sini."
            icon="default"
          />
        ) : (
          <div className="space-y-3 p-3 sm:p-4">
            {requests.map((request) => (
              <RequestCard
                key={request.id_request}
                request={request}
                onOpen={() => openDetail(request)}
              />
            ))}
            {meta?.total_pages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-foreground-muted">
                <span>
                  Halaman {meta.page || page} dari {meta.total_pages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= meta.total_pages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <ScheduleSwapCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSourceGroupChange={loadCandidates}
        sourceGroup={sourceGroup}
        candidates={filteredCandidates}
        candidateSearch={candidateSearch}
        onCandidateSearchChange={setCandidateSearch}
        candidateLoading={candidateLoading}
        selectedCandidate={selectedCandidate}
        onCandidateSelect={setSelectedCandidate}
        reason={reason}
        onReasonChange={setReason}
        submitting={submitting}
        onSubmit={submitRequest}
      />

      <ScheduleSwapDetailModal
        loading={detailLoading}
        detail={detail}
        onClose={() => setDetail(null)}
        statusLabel={STATUS_LABELS[detail?.status] || detail?.status}
        statusClassName={
          STATUS_STYLES[detail?.status] || STATUS_STYLES.KADALUARSA
        }
        canRespond={canRespond}
        canCancel={canCancel}
        responding={responding}
        onRespond={respond}
        responseNote={responseNote}
        onResponseNoteChange={setResponseNote}
      />
    </div>
  );
}
