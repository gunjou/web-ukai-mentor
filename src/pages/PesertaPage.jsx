import { AlertCircle, RefreshCw } from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PageHeader from "../components/ui/AppPageHeader";

import ParticipantClassPicker from "../components/participants/ParticipantClassPicker";
import ParticipantSummary from "../components/participants/ParticipantSummary";
import ParticipantTable from "../components/participants/ParticipantTable";

import useParticipants from "../hooks/useParticipants";

export default function PesertaPage() {
  const {
    classes,
    selectedClass,

    participants,
    meta,

    classLoading,
    loading,
    error,

    handleClassChange,
    handleRefresh,
  } = useParticipants();

  return (
    <div className="space-y-5">
      {/* ======================================
          HEADER
          ====================================== */}

      <PageHeader
        title="Peserta"
        description="Kelola dan lihat peserta pada kelas yang diampu."
        action={
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={classLoading || loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              size={15}
              className={classLoading || loading ? "animate-spin" : ""}
            />
            Refresh
          </Button>
        }
      />

      {/* ======================================
          LOADING CLASS
          ====================================== */}

      {classLoading ? (
        <Card
          className="
            flex
            min-h-[180px]
            items-center
            justify-center
          "
        >
          <LoadingSpinner size="lg" label="Memuat kelas..." />
        </Card>
      ) : error && classes.length === 0 ? (
        <Card
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
          <AlertCircle size={32} className="text-danger" />

          <h2 className="mt-3 text-base font-semibold text-foreground">
            Gagal memuat data
          </h2>

          <p className="mt-1 text-sm text-foreground-muted">{error}</p>

          <Button className="mt-4" onClick={handleRefresh}>
            <RefreshCw size={15} />
            Coba Lagi
          </Button>
        </Card>
      ) : classes.length === 0 ? (
        <Card
          className="
            flex
            min-h-[200px]
            flex-col
            items-center
            justify-center
            p-6
            text-center
          "
        >
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
          {/* ==================================
              CLASS
              ================================== */}

          <ParticipantClassPicker
            classes={classes}
            selectedClass={selectedClass}
            onClassChange={handleClassChange}
          />

          {/* ==================================
              SUMMARY
              ================================== */}

          {/* <ParticipantSummary meta={meta} selectedClass={selectedClass} /> */}

          {/* ==================================
              ERROR
              ================================== */}

          {error && (
            <Card
              className="
                flex
                items-start
                gap-3
                border-danger/20
                bg-danger-light
                p-4
              "
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />

              <div>
                <p className="text-sm font-medium text-danger">
                  Gagal memuat peserta
                </p>

                <p className="mt-1 text-xs text-foreground-secondary">
                  {error}
                </p>
              </div>
            </Card>
          )}

          {/* ==================================
              TABLE
              ================================== */}

          <ParticipantTable participants={participants} loading={loading} />
        </>
      )}
    </div>
  );
}
