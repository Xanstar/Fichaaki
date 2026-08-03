import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useClock } from "../hooks/useClock";
import { useToasts } from "../hooks/useToasts";
import { ToastContainer } from "../components/Toast";
import { StatusCard } from "../components/StatusCard";
import { AttendanceHistoryCard } from "../components/AttendanceHistoryCard";
import { Logo } from "../components/Logo";

import {
  getTodayAttendance,
  getAttendanceHistory,
  checkIn,
  checkOut,
} from "../services/attendanceService";

import type {
  AttendanceRecord,
  AttendanceStatus,
} from "../types";

function todayIso(d: Date) {
  return d.toISOString().slice(0, 10);
}



function formatExactStamp(d: Date) {
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function EmployeeDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { time, date } = useClock();

  const { toasts, push, dismiss } = useToasts();

  const [today, setToday] = useState<AttendanceRecord>({
    id: "",
    fecha: todayIso(new Date()),
    entrada: null,
    salida: null,
    horasTrabajadas: null,
    estado: "sin_registrar" as AttendanceStatus,
  });

const [history, setHistory] = useState<AttendanceRecord[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [justChecked, setJustChecked] = useState(false);

  useEffect(() => {
    async function loadAttendance() {
      if (!user) return;

      try {
        const todayRecord = await getTodayAttendance(user.id);

        if (todayRecord) {
          setToday({
            id: todayRecord.id,
            fecha: todayRecord.fecha,
            entrada: todayRecord.entrada_at
              ? new Date(todayRecord.entrada_at).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null,
            salida: todayRecord.salida_at
              ? new Date(todayRecord.salida_at).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null,
            horasTrabajadas: todayRecord.horas_trabajadas,
            estado: todayRecord.estado,
            entradaTimestamp: todayRecord.entrada_at
              ? formatExactStamp(new Date(todayRecord.entrada_at))
              : null,
            salidaTimestamp: todayRecord.salida_at
              ? formatExactStamp(new Date(todayRecord.salida_at))
              : null,
            ubicacionEntrada:
              todayRecord.entrada_lat && todayRecord.entrada_lng
                ? `Lat ${todayRecord.entrada_lat.toFixed(
                    4
                  )} · Lon ${todayRecord.entrada_lng.toFixed(4)}`
                : null,
            ubicacionSalida:
              todayRecord.salida_lat && todayRecord.salida_lng
                ? `Lat ${todayRecord.salida_lat.toFixed(
                    4
                  )} · Lon ${todayRecord.salida_lng.toFixed(4)}`
                : null,
            estadoFichaje: todayRecord.llegada_tarde
              ? "tarde"
              : "a_tiempo",
          });
        }

        const historyData = await getAttendanceHistory(user.id);

        if (historyData) {
          setHistory(
            historyData.map((r: any) => ({
              id: r.id,
              fecha: r.fecha,
              entrada: r.entrada_at
                ? new Date(r.entrada_at).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null,
              salida: r.salida_at
                ? new Date(r.salida_at).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null,
              horasTrabajadas: r.horas_trabajadas,
              estado: r.estado,
              entradaTimestamp: r.entrada_at
                ? formatExactStamp(new Date(r.entrada_at))
                : null,
              salidaTimestamp: r.salida_at
                ? formatExactStamp(new Date(r.salida_at))
                : null,
              estadoFichaje: r.llegada_tarde
                ? "tarde"
                : "a_tiempo",
            }))
          );
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadAttendance();
  }, [user]);

 

function flashCheck() {
  setJustChecked(true);
  setTimeout(() => setJustChecked(false), 900);
}

async function handleCheckIn() {
  if (!user) return;

  setIsSubmitting(true);

  try {
    console.log(
      "CLICK:",
      new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );

    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
        })
    );

    console.log(
      "UBICACIÓN:",
      new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const record = await checkIn({
      lat,
      lng,
    });

    console.log("RECORD:", record);

    console.log(
      "RESPUESTA:",
      new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );

   const entradaDate = new Date(record.entrada_at);

console.log("Hora original:", record.entrada_at);
console.log("Hora convertida:", entradaDate);

setToday({
  id: record.id,
  fecha: record.fecha,

  entrada: entradaDate.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  }),

  salida: null,

  horasTrabajadas: null,

  estado: record.estado,

  entradaTimestamp: entradaDate.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  }),

  salidaTimestamp: null,

  ubicacionEntrada: `Lat ${lat.toFixed(4)} · Lon ${lng.toFixed(4)}`,

  ubicacionSalida: null,

  estadoFichaje: record.llegada_tarde ? "tarde" : "a_tiempo",
});

    flashCheck();
    push("success", "Entrada registrada correctamente.");
  } catch (err) {
    console.error(err);
    push("error", "No se pudo registrar la entrada.");
  } finally {
    setIsSubmitting(false);
  }
}

async function handleCheckOut() {
  if (!user) return;

  setIsSubmitting(true);

  try {
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
        })
    );

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const record = await checkOut({
      lat,
      lng,
    });

    setToday({
      id: record.id,
      fecha: record.fecha,
      entrada: record.entrada_at
        ? new Date(record.entrada_at).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      salida: record.salida_at
        ? new Date(record.salida_at).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      horasTrabajadas: record.horas_trabajadas,
      estado: record.estado,
      entradaTimestamp: record.entrada_at
        ? formatExactStamp(new Date(record.entrada_at))
        : null,
      salidaTimestamp: record.salida_at
        ? formatExactStamp(new Date(record.salida_at))
        : null,
      ubicacionEntrada:
        record.entrada_lat && record.entrada_lng
          ? `Lat ${record.entrada_lat.toFixed(4)} · Lon ${record.entrada_lng.toFixed(4)}`
          : null,
      ubicacionSalida:
        record.salida_lat && record.salida_lng
          ? `Lat ${record.salida_lat.toFixed(4)} · Lon ${record.salida_lng.toFixed(4)}`
          : null,
      estadoFichaje: record.llegada_tarde ? "tarde" : "a_tiempo",
    });

    flashCheck();
    push("success", "Salida registrada correctamente.");
  } catch (err) {
    console.error(err);
    push("error", "No se pudo registrar la salida.");
  } finally {
    setIsSubmitting(false);
  }
}

function handleLogout() {
  logout();
  navigate("/login");
}
  return (
    <div className="min-h-screen bg-surface-muted pb-16">
      <ToastContainer toasts={toasts} onClose={dismiss} />

      <header className="border-b border-border-subtle bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Logo />
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-5 sm:px-5 sm:pt-8">
        <section className="rounded-[28px] border border-border-subtle bg-surface p-5 shadow-sm shadow-ink/[0.03] sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink-soft">{date}</p>
              <h1 className="mt-1 text-2xl font-bold text-ink">Hola, {user?.nombre ?? 'Empleado'}</h1>
              <p className="mt-1 text-sm text-ink-soft">Tu jornada y fichadas de hoy.</p>
            </div>
            <div className="rounded-2xl bg-brand-soft px-3 py-2 text-right">
              <p className="font-display text-2xl font-extrabold tracking-tight text-brand sm:text-3xl">{time}</p>
              <p className="text-xs font-medium text-brand/70">Hora actual</p>
            </div>
          </div>
        </section>

        <div className="mt-4 sm:mt-6">
          <StatusCard
            estado={today.estado}
            entrada={today.entrada}
            salida={today.salida}
            entradaTimestamp={today.entradaTimestamp}
            salidaTimestamp={today.salidaTimestamp}
            ubicacionEntrada={today.ubicacionEntrada}
            ubicacionSalida={today.ubicacionSalida}
            isSubmitting={isSubmitting}
            justChecked={justChecked}
            estadoFichaje={today.estadoFichaje}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </div>

        <section className="mt-8 sm:mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Historial de jornadas
          </h2>
          <div className="flex flex-col gap-2.5">
            {today.estado === 'finalizada' && <AttendanceHistoryCard record={today} />}
            {history.map((r) => (
              <AttendanceHistoryCard key={r.id} record={r} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
