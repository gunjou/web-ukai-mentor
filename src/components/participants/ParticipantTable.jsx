import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Mail, Search, Users } from "lucide-react";

import Card from "../ui/Card";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function ParticipantTable({
  participants = [],
  loading = false,
}) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  /*
   * ==========================================
   * RESET PAGE
   * ==========================================
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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

      const email = String(participant.email || "").toLowerCase();

      const idPeserta = String(participant.id_peserta || "");

      return (
        nama.includes(keyword) ||
        email.includes(keyword) ||
        idPeserta.includes(keyword)
      );
    });
  }, [participants, search]);

  /*
   * ==========================================
   * PAGINATION
   * ==========================================
   */

  const total = filteredParticipants.length;

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = Math.min(startIndex + itemsPerPage, total);

  const paginatedParticipants = useMemo(() => {
    return filteredParticipants.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredParticipants, startIndex, itemsPerPage]);

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
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <Card
        className="
          flex
          min-h-[300px]
          items-center
          justify-center
        "
      >
        <LoadingSpinner size="lg" label="Memuat peserta..." />
      </Card>
    );
  }

  return (
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
          px-5
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Daftar Peserta
          </h3>

          <p className="mt-1 text-xs text-foreground-muted">
            {total} peserta ditemukan.
          </p>
        </div>

        {/* SEARCH */}

        <div className="relative w-full sm:w-[280px]">
          <Search
            size={15}
            className="
              pointer-events-none
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
              text-sm
              text-foreground
              outline-none
              placeholder:text-foreground-muted
              focus:border-primary-500
              focus:ring-2
              focus:ring-primary-500/20
            "
          />
        </div>
      </div>

      {/* ======================================
          EMPTY
          ====================================== */}

      {paginatedParticipants.length === 0 ? (
        <div
          className="
            flex
            min-h-[220px]
            flex-col
            items-center
            justify-center
            px-5
            text-center
          "
        >
          <Users size={32} className="text-foreground-muted" />

          <p className="mt-3 text-sm font-medium text-foreground">
            Tidak ada peserta
          </p>

          <p className="mt-1 text-xs text-foreground-muted">
            {search
              ? "Tidak ada peserta yang sesuai dengan pencarian."
              : "Belum terdapat peserta pada kelas ini."}
          </p>
        </div>
      ) : (
        <>
          {/* ==================================
              TABLE
              ================================== */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-border bg-background-secondary">
                  <th
                    className="
                      px-5
                      py-3
                      text-left
                      text-xs
                      font-medium
                      text-foreground-muted
                    "
                  >
                    No
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-left
                      text-xs
                      font-medium
                      text-foreground-muted
                    "
                  >
                    Peserta
                  </th>

                  <th
                    className="
                      px-5
                      py-3
                      text-left
                      text-xs
                      font-medium
                      text-foreground-muted
                    "
                  >
                    Email
                  </th>

                  {/* <th
                    className="
                      px-5
                      py-3
                      text-left
                      text-xs
                      font-medium
                      text-foreground-muted
                    "
                  >
                    ID Peserta
                  </th> */}
                </tr>
              </thead>

              <tbody>
                {paginatedParticipants.map((participant, index) => (
                  <ParticipantRow
                    key={participant.id_peserta}
                    participant={participant}
                    number={startIndex + index + 1}
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
              px-5
              py-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            {/* LIMIT + INFO */}

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-foreground-muted">Tampilkan</span>

              <select
                value={itemsPerPage}
                onChange={handleLimitChange}
                className="
                  h-8
                  rounded-md
                  border
                  border-border
                  bg-card
                  px-2
                  text-xs
                  text-foreground
                  outline-none
                  focus:border-primary-500
                "
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <span className="text-xs text-foreground-muted">data</span>

              <span className="ml-2 text-xs text-foreground-muted">
                {total === 0
                  ? "0 data"
                  : `Menampilkan ${startIndex + 1}-${endIndex} dari ${total}`}
              </span>
            </div>

            {/* PAGE */}

            <div className="flex items-center gap-1">
              <span className="mr-2 text-xs text-foreground-muted">
                Halaman {currentPage} dari {totalPages}
              </span>

              {/* PREVIOUS */}

              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-md
                  border
                  border-border
                  text-foreground-secondary
                  transition-colors
                  hover:bg-background-tertiary
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                aria-label="Halaman sebelumnya"
              >
                <ArrowLeft size={14} />
              </button>

              {/* PAGE NUMBERS */}

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`
                    flex
                    h-8
                    min-w-8
                    items-center
                    justify-center
                    rounded-md
                    border
                    px-2
                    text-xs
                    font-medium
                    transition-colors
                    ${
                      currentPage === page
                        ? `
                          border-primary-500
                          bg-primary-500
                          text-white
                        `
                        : `
                          border-border
                          text-foreground-secondary
                          hover:bg-background-tertiary
                        `
                    }
                  `}
                >
                  {page}
                </button>
              ))}

              {/* NEXT */}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-md
                  border
                  border-border
                  text-foreground-secondary
                  transition-colors
                  hover:bg-background-tertiary
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                aria-label="Halaman berikutnya"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

/*
 * ==========================================
 * PARTICIPANT ROW
 * ==========================================
 */

function ParticipantRow({ participant, number }) {
  const initials = getInitials(participant.nama);

  return (
    <tr
      className="
        border-b
        border-border
        last:border-0
        hover:bg-background-tertiary
      "
    >
      {/* NUMBER */}

      <td className="px-5 py-3.5 text-xs text-foreground-muted">{number}</td>

      {/* PARTICIPANT */}

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary-100
              text-[10px]
              font-semibold
              text-primary-700
              dark:bg-primary-900/40
              dark:text-primary-300
            "
          >
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {participant.nama || "-"}
            </p>

            <p className="mt-0.5 text-xs text-foreground-muted">Peserta</p>
          </div>
        </div>
      </td>

      {/* EMAIL */}

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2 text-sm text-foreground-secondary">
          <Mail size={14} className="shrink-0 text-foreground-muted" />

          <span className="truncate">{participant.email || "-"}</span>
        </div>
      </td>

      {/* ID */}

      {/* <td className="px-5 py-3.5">
        <span
          className="
            inline-flex
            rounded-md
            bg-background-tertiary
            px-2
            py-1
            font-mono
            text-xs
            text-foreground-secondary
          "
        >
          {participant.id_peserta || "-"}
        </span>
      </td> */}
    </tr>
  );
}

/*
 * ==========================================
 * INITIALS
 * ==========================================
 */

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
