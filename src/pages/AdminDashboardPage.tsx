import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock3,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import {
  getAdminAttendance,
  getAttendanceByPeriod,
} from "../services/adminService";
import { supabase } from "../services/supabase";

import { AttendanceCard } from "../components/admin/AttendanceCard";

type Periodo = "dia" | "semana" | "mes";

const periodos: { id: Periodo; label: string }[] = [
  { id: "dia", label: "Día" },
  { id: "semana", label: "Semana" },
  { id: "mes", label: "Mes" },
];

function isoDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
}
function estadoLabel(estado: string) {
  if (estado === "trabajando") return "En curso";
  if (estado === "finalizada") return "Finalizada";
  return "Pendiente";
}

function estadoClase(estado: string) {
  if (estado === "trabajando")
    return "bg-success-soft text-success";

  if (estado === "finalizada")
    return "bg-brand-soft text-brand";

  return "bg-surface-muted text-ink-soft";
}

function formatDuration(hours: number | null) {
  if (hours == null) return "—";

  if (hours < 1) return `${Math.round(hours * 60)} min`;

  return `${hours.toFixed(1)} h`;
}

function googleMapsUrl(location: string | null | undefined) {
  const coordinates = location?.match(
    /Lat\s+(-?\d+(?:\.\d+)?)\s+·\s+Lon\s+(-?\d+(?:\.\d+)?)/
  );

  if (!coordinates) return null;

  return `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[2]}`;
}

export function AdminDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [periodo, setPeriodo] = useState<Periodo>("dia");
  const [weekDay, setWeekDay] = useState("");
  const [month, setMonth] = useState("");
  const [monthDay, setMonthDay] = useState("");

  const [allRecords, setAllRecords] = useState<any[]>([]);


  function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
}

function getWeekRange() {
  const today = new Date();

  const day = today.getDay();

  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: formatDate(monday),
    end: formatDate(sunday),
  };
}

function getMonthRange() {
  const now = new Date();

  const first = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const last = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  );

  return {
    start: formatDate(first),
    end: formatDate(last),
  };
}

 async function loadAttendance() {
  try {
    let data: any[] = [];

    if (periodo === "dia") {
      data = await getAdminAttendance();
    } else if (periodo === "semana") {
      const week = getWeekRange();

      data = await getAttendanceByPeriod(
        week.start,
        week.end
      );
    } else {
      const month = getMonthRange();

      data = await getAttendanceByPeriod(
        month.start,
        month.end
      );
    }

    const formatted = data.map((item: any) => {
      const employee = item.employee;
      const attendance = item.attendance;

      return {
        id: attendance?.id ?? employee.id,

        employeeId: employee.id,

        employeeName: `${employee.nombre} ${employee.apellido}`,

        cargo: employee.cargo,

        rubro: employee.rubro,

        fecha:
          attendance?.fecha ??
          new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Argentina/Buenos_Aires",
          }).format(new Date()),

        entrada: attendance?.entrada_at
          ? new Date(attendance.entrada_at).toLocaleTimeString(
              "es-AR",
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }
            )
          : null,

        salida: attendance?.salida_at
          ? new Date(attendance.salida_at).toLocaleTimeString(
              "es-AR",
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }
            )
          : null,

        horasTrabajadas:
          attendance?.horas_trabajadas ?? null,

        estado:
          attendance?.estado ?? "sin_registrar",

        estadoFichaje:
          attendance?.llegada_tarde
            ? "tarde"
            : attendance
            ? "a_tiempo"
            : null,

        ubicacionEntrada:
          attendance?.entrada_lat &&
          attendance?.entrada_lng
            ? `Lat ${attendance.entrada_lat.toFixed(
                4
              )} · Lon ${attendance.entrada_lng.toFixed(4)}`
            : null,

        ubicacionSalida:
          attendance?.salida_lat &&
          attendance?.salida_lng
            ? `Lat ${attendance.salida_lat.toFixed(
                4
              )} · Lon ${attendance.salida_lng.toFixed(4)}`
            : null,
      };
    });

    setAllRecords(formatted);
  } catch (err) {
    console.error(err);
  }
}

useEffect(() => {
  loadAttendance();

  const channel = supabase
    .channel("attendance-admin")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "attendance_records",
      },
      () => {
        console.log("Realtime: attendance cambió");
        loadAttendance();
      }
    )
   .subscribe((status) => {
  console.log("Realtime:", status);
});
  return () => {
    supabase.removeChannel(channel);
  };
}, [periodo]);

  const referenceDate = useMemo(
    () =>
      [...allRecords].sort((a, b) =>
        b.fecha.localeCompare(a.fecha)
      )[0]?.fecha ?? isoDate(new Date()),
    [allRecords]
  );

  const selectedWeekDay = weekDay || referenceDate;
  const selectedMonth = month || referenceDate.slice(0, 7);
  const selectedMonthDay = monthDay || referenceDate.slice(8, 10);

  const records = useMemo(() => {
  let filtered = [];

  if (periodo === "dia") {
    filtered = allRecords.filter(
      (record) => record.fecha === referenceDate
    );
  } else if (periodo === "semana") {
    filtered = allRecords.filter(
      (record) => record.fecha === selectedWeekDay
    );
  } else {
    filtered = allRecords.filter(
      (record) =>
        record.fecha === `${selectedMonth}-${selectedMonthDay}`
    );
  }

  return filtered.sort((a, b) => {
    // Los que están trabajando primero
    if (a.estado === "trabajando" && b.estado !== "trabajando") return -1;
    if (a.estado !== "trabajando" && b.estado === "trabajando") return 1;

    // Después los que ya ficharon
    if (a.entrada && !b.entrada) return -1;
    if (!a.entrada && b.entrada) return 1;

    // Si ninguno fichó
    if (!a.entrada && !b.entrada) {
      return a.employeeName.localeCompare(b.employeeName);
    }

    // Orden por hora de entrada (el primero que fichó arriba)
    return a.entrada.localeCompare(b.entrada);
  });
}, [
  allRecords,
  periodo,
  referenceDate,
  selectedMonth,
  selectedMonthDay,
  selectedWeekDay,
]);

const empleados = records.length;

const enCurso = records.filter(
  (record) => record.estado === "trabajando"
).length;

const tardanzas = records.filter(
  (record) => record.estadoFichaje === "tarde"
).length;

const ausentes = records.filter(
  (record) => record.estado === "sin_registrar"
).length;

  const titulo =
    periodo === "dia"
      ? "Fichadas del día"
      : periodo === "semana"
      ? "Fichadas por día"
      : "Fichadas por fecha";

  function handleLogout() {
    logout();
    navigate("/login");
  }
  return (
    <div className="min-h-screen bg-surface-muted pb-16">
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden border-l border-border-subtle pl-3 text-sm font-medium text-ink-soft sm:block">Administración</span>
          </div>
          <div className="flex items-center gap-1">
            <button
  onClick={() => navigate("/admin/empleados")}
  className="rounded-xl bg-brand px-4 py-2 font-semibold text-white transition hover:opacity-90"
>
Empleados
</button>
            <button onClick={handleLogout} className="rounded-xl px-3 py-2 text-sm font-medium text-ink-soft transition hover:text-ink">Salir</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-5 sm:px-5 sm:pt-8">
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-border-subtle bg-gradient-to-br from-brand-soft via-surface to-surface-muted p-5 shadow-sm shadow-ink/[0.03] sm:p-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-sm font-medium text-brand">
              <ShieldCheck className="h-4 w-4" /> Panel administrativo
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">Control de asistencia</h1>
            <p className="mt-1 text-sm text-ink-soft">Resumen operativo del equipo.</p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-right text-sm text-ink-soft">
            <p className="font-semibold text-ink">Hoy</p>
            <p>{new Date(`${referenceDate}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-4">
          {[
  ['Personas', empleados, Users, 'text-brand'],
  ['En curso', enCurso, Clock3, 'text-success'],
  ['Tardanzas', tardanzas, AlertTriangle, 'text-danger'],
  ['Ausentes', ausentes, MapPin, 'text-ink-soft'],
].map(([label, value, Icon, color]) => {
            const MetricIcon = Icon as typeof Users
            return (
              <div key={label as string} className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-ink-soft">{label as string}</p>
                  <MetricIcon className={`h-5 w-5 ${color as string}`} />
                </div>
                <p className="mt-2 text-3xl font-semibold text-ink">{value as number}</p>
              </div>
            )
          })}
        </section>

        <section className="mt-6 rounded-[28px] border border-border-subtle bg-surface p-4 shadow-sm shadow-ink/[0.03] sm:mt-8 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">{titulo}</h2>
            <div className="flex w-full rounded-xl bg-surface-muted p-1 sm:w-auto">
              {periodos.map((item) => (
                <button key={item.id} onClick={() => setPeriodo(item.id)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition sm:flex-none ${periodo === item.id ? 'bg-surface text-brand shadow-sm' : 'text-ink-soft hover:text-ink'}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {periodo === 'semana' && (
            <label className="mt-4 block rounded-2xl bg-brand-soft p-3 text-sm font-semibold text-ink sm:flex sm:items-center sm:gap-4">
              Día a revisar
              <input type="date" value={selectedWeekDay} onChange={(event) => setWeekDay(event.target.value)} className="mt-2 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 font-medium outline-none focus:border-brand sm:mt-0 sm:w-auto" />
            </label>
          )}

          {periodo === 'mes' && (
            <div className="mt-4 grid gap-3 rounded-2xl bg-brand-soft p-3 sm:grid-cols-2">
              <label className="text-sm font-semibold text-ink">Mes
                <input type="month" value={selectedMonth} onChange={(event) => setMonth(event.target.value)} className="mt-2 block w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 font-medium outline-none focus:border-brand" />
              </label>
              <label className="text-sm font-semibold text-ink">Día
                <select value={selectedMonthDay} onChange={(event) => setMonthDay(event.target.value)} className="mt-2 block w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 font-medium outline-none focus:border-brand">
                  {Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0')).map((day) => <option key={day} value={day}>{day}</option>)}
                </select>
              </label>
            </div>
          )}

   <div className="mt-4 flex flex-col gap-3">
  {records.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-muted px-4 py-10 text-center text-sm text-ink-soft">
      No hay fichadas para esta fecha.
    </div>
  ) : (
    records.map((record) => (
      <AttendanceCard
        key={record.id}
        record={record}
      />
    ))
  )}
</div>
        </section>
      </main>
    </div>
  )
}
