import { CalendarPlus, ClipboardCheck, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Card from "../ui/Card";
import Button from "../ui/Button";

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card>
      <h3 className="text-base font-semibold text-foreground">Aksi Cepat</h3>

      <p className="mt-1 text-xs text-foreground-muted">
        Akses fitur yang sering digunakan.
      </p>

      <div className="mt-4 grid gap-2">
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => navigate("/schedules")}
        >
          <CalendarPlus size={17} />
          Lihat Jadwal
        </Button>

        <Button
          variant="outline"
          className="justify-start"
          onClick={() => navigate("/my-attendence")}
        >
          <ClipboardCheck size={17} />
          Absensi Saya
        </Button>

        <Button
          variant="outline"
          className="justify-start"
          onClick={() => navigate("/attendence")}
        >
          <UsersRound size={17} />
          Absensi
        </Button>
      </div>
    </Card>
  );
}
