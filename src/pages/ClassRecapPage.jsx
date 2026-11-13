import {
  AlertCircle,
  BookOpen,
  CalendarRange,
  FileDown,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Pagination from "../components/ui/Pagination";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PageHeader from "../components/ui/AppPageHeader";
import ParticipantClassPicker from "../components/participants/ParticipantClassPicker";

import { getWaliKelasStatus } from "../services/profileService";
import {
  downloadRekapAbsensiKelasPdf,
  getRekapAbsensiKelas,
} from "../services/attendanceService";
import { useToast } from "../context/ToastContext";

const PAGE_SIZE = 10;

// "2026-04" -> "April 2026"
function formatBulan(value) {
  const [year, month] = value.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function persentaseVariant(value) {
  if (value >= 80) return "success";
  if (value >= 60) return "warning";
  return "danger";
}

export default function ClassRecapPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [bulan, setBulan] = useState("");

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  /*
   * Kelas = kelas yang diwalikan mentor login
   */
  useEffect(() => {
    getWaliKelasStatus()
      .then((result) => {
        // Sengaja tidak auto-pilih kelas; mentor memilih sendiri
        setClasses(result.kelas);
      })
      .catch((err) => setError(err?.message || "Gagal memuat kelas wali."))
      .finally(() => setLoadingClasses(false));
  }, []);

  /*
   * Rekap per kelas + bulan. Abaikan respons lama bila filter
   * berubah sebelum request sebelumnya selesai.
   */
  useEffect(() => {
    const idPaketkelas = selectedClass?.id_paketkelas;
    if (!idPaketkelas) return undefined;

    let active = true;
    setLoading(true);
    setError("");

    getRekapAbsensiKelas(idPaketkelas, bulan)
      .then((response) => {
        if (!active) return;
        setRows(Array.isArray(response?.data) ? response.data : []);
        setMeta(response?.meta || null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || "Gagal memuat rekap kelas.");
        setRows([]);
        setMeta(null);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [selectedClass, bulan, reloadKey]);

  function handleClassChange(id) {
    setSelectedClass(
      classes.find((item) => String(item.id_paketkelas) === String(id)) || null,
    );
    // Daftar bulan mengikuti batch kelas, jadi filter bulan direset
    setBulan("");
    // Kosongkan data kelas sebelumnya agar tidak sempat tampil
    setRows([]);
    setMeta(null);
  }

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  async function handleExport() {
    const slug = (selectedClass.nama_kelas || "kelas")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_");

    try {
      setExporting(true);
      await downloadRekapAbsensiKelasPdf(
        selectedClass.id_paketkelas,
        bulan,
        `rekap_kehadiran_${slug}_${bulan || "all"}.pdf`,
      );
    } catch (err) {
      toast.error(err?.message || "Gagal mengunduh PDF rekap kelas.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rekap Kelas"
        description="Rekap kehadiran peserta pada kelas yang Anda walikan, pertemuan online dan offline."
        action={
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={reload}
              disabled={loadingClasses || loading || !selectedClass}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button
              type="button"
              onClick={handleExport}
              disabled={!selectedClass || loading || exporting || !rows.length}
              className="flex-1 sm:flex-none"
            >
              <FileDown size={15} />
              {exporting ? "Mengunduh..." : "Export PDF"}
            </Button>
          </div>
        }
      />

      {loadingClasses ? (
        <Card className="flex min-h-[180px] items-center justify-center">
          <LoadingSpinner size="lg" label="Memuat kelas..." />
        </Card>
      ) : classes.length === 0 ? (
        <Card className="flex min-h-[200px] flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={30} className="text-foreground-muted" />
          <p className="mt-3 text-sm font-medium text-foreground">
            {error ? "Gagal memuat kelas" : "Anda bukan wali kelas"}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            {error || "Menu ini hanya untuk mentor yang menjadi wali kelas."}
          </p>
        </Card>
      ) : (
        <>
          <ParticipantClassPicker
            classes={classes}
            selectedClass={selectedClass}
            onClassChange={handleClassChange}
            description="Pilih kelas yang Anda walikan untuk melihat rekap kehadiran."
            placeholder="Pilih kelas"
          />

          {error && (
            <Card className="flex items-start gap-3 border-danger/20 bg-danger-light p-4">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
              <p className="text-sm text-danger">{error}</p>
            </Card>
          )}

          {!selectedClass ? (
            <Card className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
              <BookOpen size={32} className="text-foreground-muted" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Pilih kelas terlebih dahulu
              </p>
              <p className="mt-1 text-xs text-foreground-muted">
                Pilih kelas pada pilihan di atas untuk menampilkan rekap
                kehadiran peserta.
              </p>
            </Card>
          ) : (
            <>
              <RecapSummary
                meta={meta}
                bulan={bulan}
                onBulanChange={setBulan}
                disabled={loading}
              />

              {loading || (!meta && !error) ? (
                <Card className="flex min-h-[260px] items-center justify-center">
                  <LoadingSpinner size="lg" label="Memuat rekap kehadiran..." />
                </Card>
              ) : (
                <RecapTable rows={rows} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function RecapSummary({ meta, bulan, onBulanChange, disabled }) {
  const daftarBulan = meta?.daftar_bulan || [];
  const persentase = meta?.persentase_hadir_kelas ?? 0;
  const persentaseKeseluruhan = meta?.persentase_keseluruhan_kelas ?? 0;

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-3 lg:max-w-[640px]">
          <SummaryItem
            icon={Users}
            label="Total peserta"
            value={meta?.total_peserta ?? 0}
          />
          <SummaryItem
            icon={CalendarRange}
            label="Kehadiran (terlaksana)"
            value={
              <Badge variant={persentaseVariant(persentase)}>
                {persentase}%
              </Badge>
            }
          />
          <SummaryItem
            icon={CalendarRange}
            label="Kehadiran (keseluruhan)"
            value={`${persentaseKeseluruhan}%`}
          />
        </div>

        <div className="w-full sm:w-[240px]">
          <label
            htmlFor="filter-bulan"
            className="mb-1.5 block text-xs font-medium text-foreground-secondary"
          >
            Periode (Bulan)
          </label>
          <Select
            id="filter-bulan"
            value={bulan}
            disabled={disabled}
            onChange={(event) => onBulanChange(event.target.value)}
          >
            <option value="">--KESELURUHAN--</option>
            {daftarBulan.map((item) => (
              <option key={item} value={item}>
                {formatBulan(item)}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </Card>
  );
}

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background-secondary px-4 py-3">
      <Icon size={18} className="shrink-0 text-foreground-muted" />
      <div>
        <p className="text-xs text-foreground-muted">{label}</p>
        <div className="mt-1 text-lg font-semibold text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

function RecapTable({ rows }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) =>
      `${row.nama || ""} ${row.id_peserta || ""}`
        .toLowerCase()
        .includes(keyword),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const pageRows = filteredRows.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => setPage(1), [rows, search]);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Kehadiran Peserta
          </h3>
          <p className="mt-1 text-xs text-foreground-muted">
            Terlaksana = pertemuan yang sudah dimulai (tidak absen dihitung
            alpha). Keseluruhan = dibanding semua jadwal pada periode.
          </p>
        </div>
        <div className="relative w-full sm:w-[280px]">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama atau ID peserta..."
            aria-label="Cari peserta"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-foreground-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
          <Users size={32} className="text-foreground-muted" />
          <p className="mt-3 text-sm font-medium text-foreground">
            Tidak ada peserta
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            {rows.length === 0
              ? "Kelas ini belum memiliki peserta aktif."
              : "Data tidak ditemukan untuk pencarian ini."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-border bg-background-secondary">
                  <Th>No</Th>
                  <Th>Peserta</Th>
                  <Th align="right">Terlaksana / Jadwal</Th>
                  <Th align="right">Hadir</Th>
                  <Th align="right">Izin</Th>
                  <Th align="right">Sakit</Th>
                  <Th align="right">Alpha</Th>
                  <Th align="right">Online</Th>
                  <Th align="right">Offline</Th>
                  <Th align="right">Kehadiran (terlaksana)</Th>
                  <Th align="right">Keseluruhan</Th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr
                    key={row.id_peserta}
                    className="border-b border-border last:border-0 hover:bg-background-tertiary"
                  >
                    <td className="px-5 py-3.5 text-xs text-foreground-muted">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-foreground">
                        {row.nama || "-"}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground-muted">
                        ID: {row.id_peserta}
                      </p>
                    </td>
                    <Td>
                      {row.terlaksana}/{row.total_pertemuan}
                    </Td>
                    <Td className="text-success">{row.hadir}</Td>
                    <Td className="text-info">{row.izin}</Td>
                    <Td className="text-warning">{row.sakit}</Td>
                    <Td className="font-semibold text-danger">{row.alpha}</Td>
                    <TypeCell value={row.online} />
                    <TypeCell value={row.offline} />
                    <Td>
                      <Badge variant={persentaseVariant(row.persentase_hadir)}>
                        {row.persentase_hadir}%
                      </Badge>
                    </Td>
                    <Td className="text-foreground-secondary">
                      {row.persentase_keseluruhan}%
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t border-border px-5 py-3">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
}

// Hadir/terlaksana per tipe; persentase terlaksana & keseluruhan di bawahnya
function TypeCell({ value }) {
  if (!value?.total_pertemuan) {
    return <Td className="text-foreground-muted">-</Td>;
  }

  return (
    <Td>
      <p>
        {value.hadir}/{value.terlaksana}
      </p>
      <p
        className="text-xs text-foreground-muted"
        title="Persentase terlaksana · keseluruhan"
      >
        {value.persentase_hadir}% · {value.persentase_keseluruhan}%
      </p>
    </Td>
  );
}

function Th({ children, align = "left" }) {
  return (
    <th
      className={`whitespace-nowrap px-5 py-3 text-${align} text-xs font-medium text-foreground-muted`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td
      className={`px-5 py-3.5 text-right text-sm text-foreground ${className}`}
    >
      {children}
    </td>
  );
}
