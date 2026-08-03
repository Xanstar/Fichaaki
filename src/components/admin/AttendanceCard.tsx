import {
  AlertTriangle,
  MapPin,
} from "lucide-react";

import { motion } from "framer-motion";

type Props = {
  record: any;
};

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

  if (hours < 1)
    return `${Math.round(hours * 60)} min`;

  return `${hours.toFixed(1)} h`;
}

function googleMapsUrl(location: string | null | undefined) {
  const coordinates = location?.match(
    /Lat\s+(-?\d+(?:\.\d+)?)\s+·\s+Lon\s+(-?\d+(?:\.\d+)?)/
  );

  if (!coordinates) return null;

  return `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[2]}`;
}

export function AttendanceCard({
  record,
}: Props) {


    const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-orange-100 text-orange-600",
  "bg-pink-100 text-pink-600",
  "bg-indigo-100 text-indigo-600",
];

const avatarColor =
  avatarColors[
    record.employeeName.length % avatarColors.length
  ];

 return (
  <motion.article
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="rounded-3xl border border-border-subtle bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
  >
    {/* HEADER */}

  <div className="flex items-start justify-between">

  <div className="flex gap-3">

    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold shadow-sm ${avatarColor}`}
    >
      {record.employeeName
        ?.split(" ")
        .map((x: string) => x[0])
        .slice(0, 2)
        .join("")}
    </div>

    <div>

      <h3 className="text-lg font-bold leading-none">
        {record.employeeName}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {record.cargo} • {record.rubro}
      </p>

    </div>

  </div>

  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${estadoClase(
      record.estado
    )}`}
  >
    {estadoLabel(record.estado)}
  </span>

</div>

<div className="mt-3 flex items-center justify-between rounded-2xl bg-gray-50 p-4">

  <div className="text-center">

    <p className="text-xs uppercase text-gray-400">
      Entrada
    </p>

    <p className="mt-1 text-xl font-bold">
      {record.entrada ?? "--:--"}
    </p>

  </div>

  <div className="h-10 w-px bg-gray-200" />

  <div className="text-center">

    <p className="text-xs uppercase text-gray-400">
      Salida
    </p>

    <p className="mt-1 text-xl font-bold">
      {record.salida ?? "--:--"}
    </p>

  </div>

  <div className="h-10 w-px bg-gray-200" />

  <div className="text-center">

    <p className="text-xs uppercase text-gray-400">
      Horas
    </p>

    <p className="mt-1 text-xl font-bold">
      {formatDuration(record.horasTrabajadas)}
    </p>

  </div>

</div>

<div className="mt-4 flex flex-wrap gap-2">

  {record.estadoFichaje === "tarde" && (
    <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
      <AlertTriangle size={15} />
      Llegó tarde
    </span>
  )}

</div>

<div className="mt-4 grid grid-cols-2 gap-3">

  {googleMapsUrl(record.ubicacionEntrada) ? (
    <a
      href={googleMapsUrl(record.ubicacionEntrada)!}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-100 py-2.5 font-semibold text-emerald-700 transition-all duration-200 hover:bg-emerald-600 hover:text-white"
    >
      <MapPin size={16} />
      Ver entrada
    </a>
  ) : (
    <button
      disabled
      className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-100 py-2.5 font-semibold text-gray-400"
    >
      <MapPin size={16} />
      Ver entrada
    </button>
  )}

  {googleMapsUrl(record.ubicacionSalida) ? (
    <a
      href={googleMapsUrl(record.ubicacionSalida)!}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-center gap-2 rounded-xl bg-blue-100 py-2.5 font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-600 hover:text-white"
    >
      <MapPin size={16} />
      Ver salida
    </a>
  ) : (
    <button
      disabled
      className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-100 py-2.5 font-semibold text-gray-400"
    >
      <MapPin size={16} />
      Ver salida
    </button>
  )}

</div>

  </motion.article>
);}