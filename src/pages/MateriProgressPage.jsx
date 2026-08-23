import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  PieChart as PieChartIcon,
  RefreshCw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PageHeader from "../components/ui/AppPageHeader";
import ParticipantClassPicker from "../components/participants/ParticipantClassPicker";

import {
  getMateriProgressMonitoring,
  getMentorClasses,
} from "../services/participantService";

export default function MateriProgressPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProgress = useCallback(async (idPaketkelas) => {
    if (!idPaketkelas) {
      setParticipants([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getMateriProgressMonitoring(idPaketkelas);
      const data = Array.isArray(response?.data) ? response.data : response;

      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Gagal memuat progress materi.");
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      setError("");

      const data = await getMentorClasses();
      const availableClasses = Array.isArray(data) ? data : [];

      setClasses(availableClasses);
      setSelectedClass(availableClasses[0] || null);
    } catch (err) {
      setError(err?.message || "Gagal memuat kelas yang diampu mentor.");
      setClasses([]);
      setSelectedClass(null);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    loadProgress(selectedClass?.id_paketkelas);
  }, [selectedClass, loadProgress]);

  function handleClassChange(id) {
    setSelectedClass(
      classes.find((item) => String(item.id_paketkelas) === String(id)) || null
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Progress Materi"
        description="Monitor progress materi peserta berdasarkan paket kelas."
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => loadProgress(selectedClass?.id_paketkelas)}
            disabled={loadingClasses || loading || !selectedClass}
            className="w-full sm:w-auto"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
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
            Belum ada kelas
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            Tidak terdapat kelas yang diampu mentor.
          </p>
        </Card>
      ) : (
        <>
          <ParticipantClassPicker
            classes={classes}
            selectedClass={selectedClass}
            onClassChange={handleClassChange}
          />

          {error && (
            <Card className="flex items-start gap-3 border-danger/20 bg-danger-light p-4">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
              <p className="text-sm text-danger">{error}</p>
            </Card>
          )}

          <MateriMonitoring participants={participants} loading={loading} />
        </>
      )}
    </div>
  );
}

function MateriMonitoring({ participants, loading }) {
  const summary = useMemo(() => {
    const totalPeserta = participants.length;
    const totalMateri = participants.reduce(
      (total, item) => total + Number(item.total_materi || 0),
      0
    );
    const materiDibuka = participants.reduce(
      (total, item) => total + Number(item.materi_dibuka || 0),
      0
    );
    const rataProgress = totalPeserta
      ? participants.reduce(
          (total, item) => total + Number(item.progress_percentage || 0),
          0
        ) / totalPeserta
      : 0;

    return {
      totalPeserta,
      totalMateri,
      materiDibuka,
      rataProgress,
      materiBelumDibuka: Math.max(0, totalMateri - materiDibuka),
    };
  }, [participants]);

  if (loading) {
    return (
      <Card className="flex min-h-[260px] items-center justify-center">
        <LoadingSpinner size="lg" label="Memuat progress materi..." />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">
            Ringkasan Progress Materi
          </h3>
          <p className="mt-1 text-xs text-foreground-muted">
            Statistik umum progress materi pada kelas terpilih.
          </p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <SummaryItem label="Total peserta" value={summary.totalPeserta} />
          <SummaryItem
            label="Rata-rata progress"
            value={`${summary.rataProgress.toFixed(2)}%`}
          />
          <SummaryItem
            label="Materi belum dibuka"
            value={summary.materiBelumDibuka.toLocaleString("id-ID")}
          />
        </div>
        <MateriChart
          progress={summary.rataProgress}
          hasData={summary.totalPeserta > 0}
        />
      </Card>

      <MateriTable rows={participants} />
    </div>
  );
}

function MateriChart({ progress, hasData }) {
  if (!hasData) return null;

  const value = Math.min(100, Math.max(0, progress));
  const chartData = [
    { name: "Progress", value, color: "var(--success)" },
    { name: "Belum progress", value: 100 - value, color: "var(--border)" },
  ];

  return (
    <div className="border-b border-border px-5 py-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <PieChartIcon size={18} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Statistik Progress Materi
          </h4>
          <p className="mt-1 text-xs text-foreground-muted">
            Ringkasan rata-rata progress materi seluruh peserta.
          </p>
        </div>
      </div>
      <div className="relative h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={92}
              paddingAngle={3}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
              }}
              formatter={(chartValue) => [`${chartValue}%`, "Nilai"]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {value.toFixed(2)}%
          </span>
          <span className="text-xs text-foreground-muted">Progress</span>
        </div>
      </div>
    </div>
  );
}

function MateriTable({ rows }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) =>
      `${row.nama || ""} ${row.id_user || ""}`.toLowerCase().includes(keyword)
    );
  }, [rows, search]);
  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, total);
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  useEffect(() => setCurrentPage(1), [search, itemsPerPage, rows]);
  useEffect(
    () => setCurrentPage((page) => Math.min(page, totalPages)),
    [totalPages]
  );

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Monitoring Progress Materi
          </h3>
          <p className="mt-1 text-xs text-foreground-muted">
            {total} data ditemukan.
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
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-foreground-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>
      {total === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
          <BookOpenCheck size={32} className="text-foreground-muted" />
          <p className="mt-3 text-sm font-medium text-foreground">
            Tidak ada peserta
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            Data tidak ditemukan untuk pencarian ini.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-border bg-background-secondary">
                  <TableHeader label="No" />
                  <TableHeader label="Peserta" />
                  <TableHeader label="Total materi" align="right" />
                  <TableHeader label="Materi dibuka" align="right" />
                  <TableHeader label="Belum dibuka" align="right" />
                  <TableHeader label="Progress" align="right" />
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, index) => (
                  <MateriRow
                    key={row.id_user || index}
                    row={row}
                    number={startIndex + index + 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            total={total}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
          />
        </>
      )}
    </Card>
  );
}

function TableHeader({ label, align = "left" }) {
  return (
    <th
      className={`px-5 py-3 text-${align} text-xs font-medium text-foreground-muted`}
    >
      {label}
    </th>
  );
}

function MateriRow({ row, number }) {
  const initials = (row.nama || "-")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <tr className="border-b border-border last:border-0 hover:bg-background-tertiary">
      <td className="px-5 py-3.5 text-xs text-foreground-muted">{number}</td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {row.nama || "-"}
            </p>
            <p className="mt-0.5 text-xs text-foreground-muted">
              ID: {row.id_user || "-"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-right text-sm text-foreground">
        {row.total_materi ?? 0}
      </td>
      <td className="px-5 py-3.5 text-right text-sm text-success">
        {row.materi_dibuka ?? 0}
      </td>
      <td className="px-5 py-3.5 text-right text-sm font-semibold text-danger">
        {row.materi_belum_dibuka ?? 0}
      </td>
      <td className="px-5 py-3.5 text-right text-sm text-foreground">
        {row.progress_percentage ?? 0}%
      </td>
    </tr>
  );
}

function Pagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  total,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
}) {
  const pages = [];
  for (
    let page = Math.max(1, currentPage - 2);
    page <= Math.min(totalPages, currentPage + 2);
    page += 1
  )
    pages.push(page);
  return (
    <div className="flex flex-col gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-foreground-muted">Tampilkan</span>
        <select
          value={itemsPerPage}
          onChange={(event) => setItemsPerPage(Number(event.target.value))}
          className="h-8 rounded-md border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-primary-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="text-xs text-foreground-muted">data</span>
        <span className="ml-2 text-xs text-foreground-muted">
          Menampilkan {startIndex + 1}-{endIndex} dari {total}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="mr-2 text-xs text-foreground-muted">
          Halaman {currentPage} dari {totalPages}
        </span>
        <PaginationButton
          label="Halaman sebelumnya"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
        >
          <ArrowLeft size={14} />
        </PaginationButton>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => setCurrentPage(page)}
            className={`flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-medium ${
              currentPage === page
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-border text-foreground-secondary hover:bg-background-tertiary"
            }`}
          >
            {page}
          </button>
        ))}
        <PaginationButton
          label="Halaman berikutnya"
          disabled={currentPage >= totalPages}
          onClick={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
        >
          <ArrowRight size={14} />
        </PaginationButton>
      </div>
    </div>
  );
}

function PaginationButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground-secondary transition-colors hover:bg-background-tertiary disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background-secondary px-4 py-3">
      <p className="text-xs text-foreground-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
