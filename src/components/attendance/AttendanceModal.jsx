import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function AttendanceModal({
  mode,
  participant,
  participants,
  status,
  setStatus,
  onParticipantChange,
  submitting,
  error,
  onClose,
  onSubmit,
}) {
  const isCreate = mode === "create";

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title={isCreate ? "Tambah Absen Manual" : "Ubah Kehadiran"}
      description={
        isCreate
          ? "Tambahkan kehadiran peserta secara manual."
          : "Ubah status kehadiran peserta."
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Batal
          </Button>

          <Button
            type="button"
            onClick={onSubmit}
            disabled={submitting || (isCreate && !participant)}
          >
            {submitting
              ? "Menyimpan..."
              : isCreate
              ? "Tambah Absen"
              : "Simpan Perubahan"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {isCreate ? (
          <div>
            <label
              htmlFor="attendance-participant"
              className="mb-1.5 block text-xs font-medium text-foreground-secondary"
            >
              Peserta
            </label>

            <select
              id="attendance-participant"
              value={participant?.id_peserta || ""}
              onChange={(event) => {
                const selected = participants.find(
                  (item) => String(item.id_peserta) === event.target.value
                );

                onParticipantChange(selected || null);
              }}
              disabled={submitting || participants.length === 0}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">Pilih peserta</option>

              {participants.map((item) => (
                <option key={item.id_peserta} value={item.id_peserta}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-background-tertiary p-3">
            <p className="text-[10px] uppercase tracking-wide text-foreground-muted">
              Peserta
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {participant?.nama || "-"}
            </p>

            {participant?.nickname && (
              <p className="mt-0.5 text-xs text-foreground-muted">
                @{participant.nickname}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="attendance-status"
            className="mb-1.5 block text-xs font-medium text-foreground-secondary"
          >
            Status Kehadiran
          </label>

          <select
            id="attendance-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={submitting}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="HADIR">Hadir</option>
            <option value="IZIN">Izin</option>
            <option value="SAKIT">Sakit</option>
            <option value="ALPHA">Alpha</option>
          </select>
        </div>

        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger-light px-3 py-2 text-xs text-danger">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
