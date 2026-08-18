import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  UserRound,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  MapPin,
} from "lucide-react";

import Card from "../ui/Card";
import Button from "../ui/Button";

import { formatDateTime } from "../../utils/date";

import {
  createParticipantAttendance,
  updateParticipantAttendance,
  deleteParticipantAttendance,
} from "../../services/attendanceService";

import { useToast } from "../../context/ToastContext";

export default function AttendanceTable({
  participants = [],
  loading,
  onRefresh,
}) {
  const toast = useToast();

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [modal, setModal] = useState(null);

  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState("HADIR");

  const [submitting, setSubmitting] = useState(false);

  const [actionError, setActionError] = useState("");

  /*
   * ==========================================
   * RESET PAGE WHEN SEARCH CHANGES
   * ==========================================
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /*
   * ==========================================
   * RESET PAGE WHEN LIMIT CHANGES
   * ==========================================
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  /*
   * ==========================================
   * SEARCH
   * ==========================================
   */

  const filteredParticipants = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return participants;
    }

    return participants.filter((participant) => {
      const nama = String(participant.nama || "").toLowerCase();

      const nickname = String(participant.nickname || "").toLowerCase();

      const idPeserta = String(participant.id_peserta || "");

      return (
        nama.includes(keyword) ||
        nickname.includes(keyword) ||
        idPeserta.includes(keyword)
      );
    });
  }, [participants, search]);

  /*
   * ==========================================
   * PAGINATION
   * ==========================================
   */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredParticipants.length / itemsPerPage)
  );

  /*
   * Pastikan current page tidak melebihi
   * jumlah halaman setelah data berubah.
   */

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedParticipants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;

    return filteredParticipants.slice(start, start + itemsPerPage);
  }, [filteredParticipants, currentPage, itemsPerPage]);

  /*
   * ==========================================
   * PAGE NUMBERS
   * ==========================================
   */

  const pageNumbers = useMemo(() => {
    const pages = [];

    const start = Math.max(1, currentPage - 2);

    const end = Math.min(totalPages, currentPage + 2);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  /*
   * ==========================================
   * AVAILABLE PARTICIPANTS
   * ==========================================
   */

  const availableParticipants = useMemo(() => {
    return participants.filter((participant) => !participant.sudah_absen);
  }, [participants]);

  /*
   * ==========================================
   * SEARCH
   * ==========================================
   */

  function handleSearchChange(event) {
    setSearch(event.target.value);
  }

  /*
   * ==========================================
   * LIMIT
   * ==========================================
   */

  function handleLimitChange(event) {
    setItemsPerPage(Number(event.target.value));
  }

  /*
   * ==========================================
   * OPEN CREATE
   * ==========================================
   */

  function openCreateModal() {
    setActionError("");

    setSelectedParticipant(availableParticipants[0] || null);

    setSelectedStatus("HADIR");

    setModal("create");
  }

  /*
   * ==========================================
   * OPEN EDIT
   * ==========================================
   */

  function openEditModal(participant) {
    if (!participant.id_absensi_peserta) {
      return;
    }

    setActionError("");

    setSelectedParticipant(participant);

    setSelectedStatus(normalizeStatus(participant.status_kehadiran) || "HADIR");

    setModal("edit");
  }

  /*
   * ==========================================
   * CLOSE MODAL
   * ==========================================
   */

  function closeModal() {
    if (submitting) {
      return;
    }

    setModal(null);
    setSelectedParticipant(null);
    setActionError("");
  }

  /*
   * ==========================================
   * CREATE
   * ==========================================
   */

  async function handleCreate() {
    if (!selectedParticipant) {
      setActionError("Silakan pilih peserta.");
      return;
    }

    if (!selectedParticipant.id_jadwal) {
      setActionError("ID jadwal tidak tersedia.");
      return;
    }

    if (!selectedParticipant.id_peserta) {
      setActionError("ID peserta tidak tersedia.");
      return;
    }

    try {
      setSubmitting(true);
      setActionError("");

      await createParticipantAttendance({
        id_jadwal: selectedParticipant.id_jadwal,
        id_peserta: selectedParticipant.id_peserta,
        status_kehadiran: selectedStatus,
      });

      toast.success("Absensi peserta berhasil ditambahkan.");

      setModal(null);
      setSelectedParticipant(null);

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("CREATE MANUAL ATTENDANCE ERROR:", error);

      const message = error?.message || "Gagal menambahkan absensi peserta.";

      setActionError(message);

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ==========================================
   * UPDATE
   * ==========================================
   */

  async function handleUpdate() {
    if (!selectedParticipant?.id_absensi_peserta) {
      setActionError("ID absensi tidak tersedia.");
      return;
    }

    try {
      setSubmitting(true);
      setActionError("");

      await updateParticipantAttendance(
        selectedParticipant.id_absensi_peserta,
        {
          status_kehadiran: selectedStatus,
        }
      );

      toast.success("Kehadiran peserta berhasil diperbarui.");

      setModal(null);
      setSelectedParticipant(null);

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("UPDATE ATTENDANCE ERROR:", error);

      const message = error?.message || "Gagal mengubah status kehadiran.";

      setActionError(message);

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ==========================================
   * DELETE
   * ==========================================
   */

  async function handleDelete(participant) {
    if (!participant.id_absensi_peserta) {
      return;
    }

    const confirmed = window.confirm(
      `Hapus absensi ${participant.nama || "peserta"}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);

      await deleteParticipantAttendance(participant.id_absensi_peserta);

      toast.success("Absensi peserta berhasil dihapus.");

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("DELETE ATTENDANCE ERROR:", error);

      const message = error?.message || "Gagal menghapus absensi peserta.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <>
      <Card className="overflow-hidden p-0">
        {/* ======================================
            HEADER
            ====================================== */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-b
            border-border
            px-4
            py-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Daftar Peserta
            </h2>

            <p className="mt-0.5 text-xs text-foreground-muted">
              Daftar kehadiran peserta pada jadwal yang dipilih.
            </p>
          </div>

          <div
            className="
              flex
              flex-col
              gap-2
              sm:flex-row
              sm:items-center
            "
          >
            {/* SEARCH */}

            <div className="relative">
              <Search
                size={14}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-foreground-muted
                "
              />

              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Cari peserta..."
                className="
                  h-9
                  w-full
                  rounded-lg
                  border
                  border-border
                  bg-card
                  pl-9
                  pr-3
                  text-xs
                  text-foreground
                  outline-none
                  placeholder:text-foreground-muted
                  focus:border-primary
                  sm:w-48
                "
              />
            </div>

            {/* TOTAL */}

            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <UserRound size={14} />

              <span>{participants.length} peserta</span>
            </div>

            {/* ADD */}

            <Button
              type="button"
              size="sm"
              onClick={openCreateModal}
              disabled={
                loading || submitting || availableParticipants.length === 0
              }
            >
              <Plus size={15} />
              Tambah Absen
            </Button>
          </div>
        </div>

        {/* ======================================
            LOADING
            ====================================== */}

        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <Clock3 size={16} className="animate-spin" />
              Memuat kehadiran peserta...
            </div>
          </div>
        ) : participants.length === 0 ? (
          <div
            className="
              flex
              min-h-[250px]
              flex-col
              items-center
              justify-center
              p-6
              text-center
            "
          >
            <UserRound size={32} className="text-foreground-muted" />

            <p className="mt-3 text-sm font-medium text-foreground">
              Belum ada peserta
            </p>

            <p className="mt-1 text-xs text-foreground-muted">
              Tidak ada data peserta pada jadwal ini.
            </p>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div
            className="
              flex
              min-h-[250px]
              flex-col
              items-center
              justify-center
              p-6
              text-center
            "
          >
            <Search size={30} className="text-foreground-muted" />

            <p className="mt-3 text-sm font-medium text-foreground">
              Peserta tidak ditemukan
            </p>

            <p className="mt-1 text-xs text-foreground-muted">
              Coba gunakan kata pencarian lain.
            </p>
          </div>
        ) : (
          <>
            {/* ==================================
                TABLE
                ================================== */}

            <div className="overflow-x-auto">
              <table
                className="
                  w-full
                  min-w-[1150px]
                  border-separate
                  border-spacing-0
                  text-sm
                "
              >
                <thead>
                  <tr className="bg-background-tertiary">
                    <th
                      className="
                        sticky
                        left-0
                        z-30
                        w-12
                        border-b
                        border-border
                        bg-background-tertiary
                        px-4
                        py-3
                        text-center
                        text-xs
                        font-semibold
                        text-foreground-secondary
                      "
                    >
                      No
                    </th>

                    <th
                      className="
                        sticky
                        left-12
                        z-30
                        min-w-[180px]
                        border-b
                        border-border
                        bg-background-tertiary
                        px-4
                        py-3
                        text-left
                        text-xs
                        font-semibold
                        text-foreground-secondary
                      "
                    >
                      Peserta
                    </th>

                    <th
                      className="
                        min-w-[110px]
                        border-b
                        border-border
                        px-4
                        py-3
                        text-left
                        text-xs
                        font-semibold
                        text-foreground-secondary
                      "
                    >
                      Status
                    </th>

                    <th
                      className="
                        min-w-[140px]
                        border-b
                        border-border
                        px-4
                        py-3
                        text-left
                        text-xs
                        font-semibold
                        text-foreground-secondary
                      "
                    >
                      Tanggal
                    </th>

                    <th
                      className="
                        min-w-[120px]
                        border-b
                        border-border
                        px-4
                        py-3
                        text-left
                        text-xs
                        font-semibold
                        text-foreground-secondary
                      "
                    >
                      Pukul
                    </th>

                    <th
                      className="
                        min-w-[140px]
                        border-b
                        border-border
                        px-4
                        py-3
                        text-left
                        text-xs
                        font-semibold
                        text-foreground-secondary
                      "
                    >
                      Accuracy
                    </th>

                    <th
                      className="
                        sticky
                        right-0
                        z-30
                        min-w-[150px]
                        border-b
                        border-border
                        bg-background-tertiary
                        px-4
                        py-3
                        text-left
                        text-xs
                        font-semibold
                        text-foreground-secondary
                      "
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border capitalize">
                  {paginatedParticipants.map((participant, index) => (
                    <AttendanceRow
                      key={participant.id_peserta}
                      participant={participant}
                      index={(currentPage - 1) * itemsPerPage + index}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      submitting={submitting}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* ==================================
                PAGINATION
                ================================== */}

            <div
              className="
                flex
                flex-col
                gap-3
                border-t
                border-border
                px-4
                py-3
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >
              {/* LEFT */}

              <div
                className="
                  flex
                  flex-col
                  gap-2
                  text-xs
                  text-foreground-muted
                  sm:flex-row
                  sm:items-center
                "
              >
                <p>
                  Menampilkan{" "}
                  <span className="font-medium text-foreground">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium text-foreground">
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredParticipants.length
                    )}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium text-foreground">
                    {filteredParticipants.length}
                  </span>{" "}
                  peserta
                </p>

                {/* LIMIT */}

                <div className="flex items-center gap-2">
                  <span>Per halaman:</span>

                  <select
                    value={itemsPerPage}
                    onChange={handleLimitChange}
                    className="
                      h-8
                      rounded-lg
                      border
                      border-border
                      bg-card
                      px-2
                      text-xs
                      text-foreground
                      outline-none
                      focus:border-primary
                    "
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* RIGHT */}

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                >
                  <ChevronLeft size={15} />
                </Button>

                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    type="button"
                    variant={page === currentPage ? "primary" : "outline"}
                    size="sm"
                    className="min-w-8"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                >
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* ========================================
          MODAL
          ======================================== */}

      {modal && (
        <AttendanceModal
          mode={modal}
          participant={selectedParticipant}
          participants={availableParticipants}
          status={selectedStatus}
          setStatus={setSelectedStatus}
          onParticipantChange={setSelectedParticipant}
          submitting={submitting}
          error={actionError}
          onClose={closeModal}
          onSubmit={modal === "create" ? handleCreate : handleUpdate}
        />
      )}
    </>
  );
}

/*
 * ==========================================
 * ROW
 * ==========================================
 */

function AttendanceRow({ participant, index, onEdit, onDelete, submitting }) {
  const status = normalizeStatus(participant.status_kehadiran);

  const hasAttendance = Boolean(participant.id_absensi_peserta);

  const checkInDate = getDatePart(participant.check_in_at);

  const checkInTime = getTimePart(participant.check_in_at);

  return (
    <tr className="group">
      {/* NO */}

      <td
        className="
          sticky
          left-0
          z-20
          w-12
          border-border
          bg-card
          px-4
          py-3
          text-center
          text-xs
          text-foreground-muted
          group-hover:bg-background-tertiary
        "
      >
        {index + 1}
      </td>

      {/* PESERTA */}

      <td
        className="
          sticky
          left-12
          z-20
          min-w-[180px] 
          border-border
          bg-card
          px-4
          py-3
          group-hover:bg-background-tertiary
        "
      >
        <p
          className="
            truncate
            text-sm
            font-medium
            text-foreground
          "
        >
          {participant.nickname || participant.nama || "-"}
        </p>
      </td>

      {/* STATUS */}

      <td className="px-4 py-3">
        <StatusBadge status={status} />
      </td>

      {/* TANGGAL */}

      <td className="px-4 py-3">
        {checkInDate ? (
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-success" />

            <span className="text-xs text-foreground-secondary">
              {checkInDate}
            </span>
          </div>
        ) : (
          <span className="text-xs text-foreground-muted">-</span>
        )}
      </td>

      {/* PUKUL */}

      <td className="px-4 py-3">
        {checkInTime ? (
          <div className="flex items-center gap-2">
            <Clock3 size={14} className="text-foreground-muted" />

            <span className="text-xs text-foreground-secondary">
              {checkInTime}
            </span>
          </div>
        ) : (
          <span className="text-xs text-foreground-muted">-</span>
        )}
      </td>

      {/* ACCURACY */}

      <td className="px-4 py-3">
        {participant.location_accuracy != null ? (
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-foreground-muted" />

            <span className="text-xs text-foreground-secondary">
              {Number(participant.location_accuracy).toFixed(2)} m
            </span>
          </div>
        ) : (
          <span className="text-xs text-foreground-muted">-</span>
        )}
      </td>

      {/* AKSI */}

      <td
        className="
          sticky
          right-0
          z-20
          border-border
          bg-card
          px-4
          py-3
          group-hover:bg-background-tertiary
        "
      >
        {hasAttendance ? (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(participant)}
              disabled={submitting}
              title="Ubah absensi"
            >
              <Pencil size={14} />
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onDelete(participant)}
              disabled={submitting}
              title="Hapus absensi"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ) : (
          <span className="text-xs text-foreground-muted">Belum absen</span>
        )}
      </td>
    </tr>
  );
}

/*
 * ==========================================
 * MODAL
 * ==========================================
 */

function AttendanceModal({
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
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        p-4
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-border
          bg-card
          shadow-xl
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-border
            px-5
            py-4
          "
        >
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {isCreate ? "Tambah Absen Manual" : "Ubah Kehadiran"}
            </h3>

            <p className="mt-0.5 text-xs text-foreground-muted">
              {isCreate
                ? "Tambahkan kehadiran peserta secara manual."
                : "Ubah status kehadiran peserta."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="
              rounded-lg
              p-1.5
              text-foreground-muted
              hover:bg-background-tertiary
              hover:text-foreground
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}

        <div className="space-y-4 p-5">
          {/* PESERTA */}

          {isCreate ? (
            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-medium
                  text-foreground-secondary
                "
              >
                Peserta
              </label>

              <select
                value={participant?.id_peserta || ""}
                onChange={(event) => {
                  const selected = participants.find(
                    (item) => String(item.id_peserta) === event.target.value
                  );

                  onParticipantChange(selected || null);
                }}
                disabled={submitting || participants.length === 0}
                className="
                  w-full
                  rounded-lg
                  border
                  border-border
                  bg-card
                  px-3
                  py-2.5
                  text-sm
                  text-foreground
                  outline-none
                  focus:border-primary
                "
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
            <div
              className="
                rounded-xl
                border
                border-border
                bg-background-tertiary
                p-3
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-wide
                  text-foreground-muted
                "
              >
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

          {/* STATUS */}

          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-medium
                text-foreground-secondary
              "
            >
              Status Kehadiran
            </label>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={submitting}
              className="
                w-full
                rounded-lg
                border
                border-border
                bg-card
                px-3
                py-2.5
                text-sm
                text-foreground
                outline-none
                focus:border-primary
              "
            >
              <option value="HADIR">Hadir</option>

              <option value="IZIN">Izin</option>

              <option value="SAKIT">Sakit</option>

              <option value="ALPHA">Alpha</option>
            </select>
          </div>

          {/* ERROR */}

          {error && (
            <div
              className="
                rounded-lg
                border
                border-danger/20
                bg-danger-light
                px-3
                py-2
                text-xs
                text-danger
              "
            >
              {error}
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div
          className="
            flex
            justify-end
            gap-2
            border-t
            border-border
            px-5
            py-4
          "
        >
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
        </div>
      </div>
    </div>
  );
}

/*
 * ==========================================
 * STATUS BADGE
 * ==========================================
 */

function StatusBadge({ status }) {
  const config = {
    HADIR: {
      label: "Hadir",
      className: "bg-success-light text-success border-success/20",
    },

    IZIN: {
      label: "Izin",
      className: "bg-warning-light text-warning border-warning/20",
    },

    SAKIT: {
      label: "Sakit",
      className: "bg-info-light text-info border-info/20",
    },

    ALPHA: {
      label: "Alpha",
      className: "bg-danger-light text-danger border-danger/20",
    },
  };

  const current = config[status] || {
    label: status || "-",
    className: "bg-background-tertiary text-foreground-muted border-border",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-[11px]
        font-medium
        ${current.className}
      `}
    >
      {current.label}
    </span>
  );
}

/*
 * ==========================================
 * DATE / TIME HELPERS
 * ==========================================
 */

function getDatePart(value) {
  if (!value) {
    return null;
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return null;
  }
}

function getTimePart(value) {
  if (!value) {
    return null;
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return null;
  }
}

/*
 * ==========================================
 * HELPERS
 * ==========================================
 */

function normalizeStatus(status) {
  return String(status || "")
    .trim()
    .toUpperCase();
}

function getInitial(name) {
  if (!name) {
    return "?";
  }

  return name.charAt(0).toUpperCase();
}
