import {
  ArrowLeftRight,
  CalendarDays,
  Check,
  Clock3,
  Search,
  X,
} from "lucide-react";

import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import { formatScheduleDate, formatTime } from "../../utils/schedule";

export function ScheduleGroupSummary({
  group,
  mentorName,
  compact = false,
  selected = false,
}) {
  if (!group) {
    return null;
  }

  const schedules = group.jadwal || [];

  return (
    <div
      className={`rounded-xl border ${
        compact
          ? selected
            ? "border-primary-500/30 bg-transparent p-2 dark:border-primary-300/40"
            : "border-border bg-transparent p-2"
          : "border-border bg-background-secondary p-4"
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {mentorName && (
          <span
            className={`font-semibold ${
              selected
                ? "text-primary-700 dark:text-primary-300"
                : "text-foreground"
            }`}
          >
            {mentorName}
          </span>
        )}
        <span
          className={`inline-flex items-center gap-1.5 ${
            selected
              ? "text-foreground-secondary dark:text-foreground"
              : "text-foreground-secondary"
          }`}
        >
          <CalendarDays size={15} />
          {formatScheduleDate(group.tanggal)}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 ${
            selected
              ? "text-foreground-secondary dark:text-foreground"
              : "text-foreground-secondary"
          }`}
        >
          <Clock3 size={15} />
          {formatTime(group.waktu_mulai)}–{formatTime(group.waktu_selesai)} WIB
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            selected
              ? "bg-primary-100 text-primary-800 dark:bg-background dark:text-primary-200"
              : "bg-background-tertiary text-foreground-muted"
          }`}
        >
          {group.total_jadwal || schedules.length || 0} jadwal
        </span>
      </div>
      {schedules.length > 0 && (
        <ul
          className={`mt-3 space-y-1 ${
            compact
              ? selected
                ? "border-t border-primary-500/20 pt-2 dark:border-primary-300/30"
                : "border-t border-border/70 pt-2"
              : "border-t border-border pt-3"
          }`}
        >
          {schedules.map((schedule, index) => (
            <li
              key={schedule.id_jadwal || `${schedule.nama_kelas}-${index}`}
              className={`text-xs ${
                selected
                  ? "text-foreground-secondary dark:text-foreground"
                  : "text-foreground-secondary"
              }`}
            >
              {schedule.nama_kelas || schedule.nama_kelompok || "Jadwal"}
              {schedule.topik ? ` · ${schedule.topik}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ScheduleSwapCreateModal({
  open,
  onClose,
  groups,
  selectedGroupId,
  onSourceGroupChange,
  sourceGroup,
  candidates,
  candidateSearch,
  onCandidateSearchChange,
  candidateLoading,
  selectedCandidate,
  onCandidateSelect,
  reason,
  onReasonChange,
  submitting,
  onSubmit,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajukan tukar jadwal"
      description="Pilih grup jadwal milik Anda, lalu tentukan kandidat yang tersedia."
      icon={ArrowLeftRight}
      size="xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={onSubmit}
            loading={submitting}
            disabled={!sourceGroup || !selectedCandidate || reason.length > 500}
          >
            Kirim request
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="source-group"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Jadwal asal
          </label>
          <Select
            id="source-group"
            value={selectedGroupId}
            onChange={(event) => onSourceGroupChange(event.target.value)}
            placeholder="Pilih jadwal yang ingin ditukar"
          >
            {groups.map((group) => (
              <option key={group.id_jadwal} value={group.id_jadwal}>
                {formatScheduleDate(group.tanggal)} ·{" "}
                {formatTime(group.waktu_mulai)}–
                {formatTime(group.waktu_selesai)} · {group.total_jadwal} jadwal
              </option>
            ))}
          </Select>
          {groups.length === 0 && (
            <p className="mt-2 text-xs text-foreground-muted">
              Tidak ada grup jadwal yang bisa dipilih.
            </p>
          )}
        </div>

        {sourceGroup && (
          <ScheduleGroupSummary group={sourceGroup} mentorName="Jadwal Anda" />
        )}

        {selectedGroupId && (
          <section className="space-y-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
              />
              <input
                value={candidateSearch}
                onChange={(event) =>
                  onCandidateSearchChange(event.target.value)
                }
                placeholder="Cari mentor, kelas, atau kelompok"
                className="h-10 w-full rounded-lg border border-input-border bg-input pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary-500"
              />
            </div>

            {candidateLoading ? (
              <div className="flex min-h-[140px] items-center justify-center">
                <LoadingSpinner label="Mencari kandidat..." />
              </div>
            ) : candidates.length === 0 ? (
              <p className="rounded-lg bg-background-tertiary p-4 text-center text-sm text-foreground-muted">
                Tidak ada jadwal yang bisa ditukar.
              </p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {candidates.map((candidate) => {
                  const candidateId = String(
                    candidate.id_jadwal_list?.[0] || candidate.id_jadwal
                  );
                  const selected =
                    String(
                      selectedCandidate?.id_jadwal_list?.[0] ||
                        selectedCandidate?.id_jadwal
                    ) === candidateId;

                  return (
                    <button
                      key={`${candidate.id_mentor}-${candidateId}`}
                      type="button"
                      onClick={() => onCandidateSelect(candidate)}
                      className={`w-full rounded-xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                        selected
                          ? "border-primary-500 bg-primary-50 text-foreground shadow-sm ring-1 ring-primary-500/20 dark:border-primary-300 dark:bg-background-tertiary dark:text-foreground dark:ring-primary-300/40"
                          : "border-border hover:border-primary-500/40 hover:bg-background-secondary"
                      }`}
                    >
                      <ScheduleGroupSummary
                        group={candidate}
                        mentorName={candidate.nama_mentor}
                        compact
                        selected={selected}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <div>
          <label
            htmlFor="swap-reason"
            className="mb-1.5 block text-xs font-semibold text-foreground"
          >
            Alasan{" "}
            <span className="font-normal text-foreground-muted">
              (opsional)
            </span>
          </label>
          <Textarea
            id="swap-reason"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            maxLength={500}
            placeholder="Sampaikan alasan pertukaran jadwal..."
            resize="none"
          />
          <p className="mt-1 text-right text-[11px] text-foreground-muted">
            {reason.length}/500
          </p>
        </div>
      </div>
    </Modal>
  );
}

export function ScheduleSwapDetailModal({
  loading,
  detail,
  onClose,
  statusLabel,
  statusClassName,
  canRespond,
  canCancel,
  responding,
  onRespond,
  responseNote,
  onResponseNoteChange,
}) {
  return (
    <Modal
      open={loading || Boolean(detail)}
      onClose={onClose}
      title={detail ? `Detail request` : "Memuat detail request"}
      description={"Lihat detail request tukar jadwal"}
      icon={ArrowLeftRight}
      size="xl"
      footer={
        detail && (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
            {canCancel && (
              <Button
                variant="danger"
                loading={responding}
                onClick={() => onRespond("batal")}
              >
                Batalkan request
              </Button>
            )}
            {canRespond && (
              <>
                <Button
                  variant="danger"
                  loading={responding}
                  onClick={() => onRespond("tolak")}
                >
                  <X size={15} />
                  Tolak
                </Button>
                <Button
                  loading={responding}
                  onClick={() => onRespond("terima")}
                >
                  <Check size={15} />
                  Terima & tukar
                </Button>
              </>
            )}
          </div>
        )
      }
    >
      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <LoadingSpinner size="lg" label="Memuat detail request..." />
        </div>
      ) : detail ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-foreground-secondary">
              {detail.mentor_pengaju?.nama || "Mentor pengaju"}{" "}
              <span className="mx-1">↔</span>{" "}
              {detail.mentor_tujuan?.nama || "Mentor tujuan"}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClassName}`}
            >
              {statusLabel}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold text-foreground">
                Jadwal asal
              </h3>
              <ScheduleGroupSummary
                group={detail.grup_asal}
                mentorName={detail.mentor_pengaju?.nama}
              />
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold text-foreground">
                Jadwal tujuan
              </h3>
              <ScheduleGroupSummary
                group={detail.grup_tujuan}
                mentorName={detail.mentor_tujuan?.nama}
              />
            </div>
          </div>
          {detail.alasan && (
            <div>
              <h3 className="text-xs font-semibold text-foreground">Alasan</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground-secondary">
                {detail.alasan}
              </p>
            </div>
          )}
          {detail.catatan_respon && (
            <div>
              <h3 className="text-xs font-semibold text-foreground">
                Catatan respon
              </h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground-secondary">
                {detail.catatan_respon}
              </p>
            </div>
          )}
          {(canRespond || canCancel) && (
            <div>
              <label
                htmlFor="response-note"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Catatan respon{" "}
                <span className="font-normal text-foreground-muted">
                  (opsional)
                </span>
              </label>
              <Textarea
                id="response-note"
                value={responseNote}
                onChange={(event) => onResponseNoteChange(event.target.value)}
                maxLength={500}
                placeholder="Tulis catatan untuk mentor..."
                resize="none"
              />
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
