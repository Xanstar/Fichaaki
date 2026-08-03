import { useEffect, useState } from "react";
import {
  createEmployee,
  updateEmployee,
} from "../services/employeeService";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Briefcase,
  Clock3,
  ShieldCheck,
  X,
} from "lucide-react";




type Props = {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  employee?: any;
};

export function EmployeeModal({
  open,
  onClose,
  mode = "create",
  employee,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 const [rubro, setRubro] = useState("");
const [cargo, setCargo] = useState("");
  const [jornadaInicio, setJornadaInicio] = useState("");
  const [jornadaFin, setJornadaFin] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && employee) {
      setNombre(employee.nombre ?? "");
      setApellido(employee.apellido ?? "");
      setEmail(employee.email ?? "");
      setRubro(employee.rubro ?? "");
setCargo(employee.cargo ?? "");
      setJornadaInicio(employee.jornada_inicio ?? "");
      setJornadaFin(employee.jornada_fin ?? "");
      setPassword("");
    }

    if (mode === "create") {
      setNombre("");
      setApellido("");
      setEmail("");
      setPassword("");
      setCargo("");
      setRubro("");
      setJornadaInicio("");
      setJornadaFin("");
    }
  }, [employee, mode, open]);

 

  async function handleSaveEmployee() {
    if (
      !nombre ||
      !apellido ||
      !email ||
      !cargo ||
      !jornadaInicio ||
      !jornadaFin
    ) {
      alert("Completa todos los campos.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "create") {
        if (!password) {
          alert("La contraseña es obligatoria.");
          return;
        }

   await createEmployee({
  nombre,
  apellido,
  email,
  password,
  cargo,
  rubro,
  jornada_inicio: jornadaInicio,
  jornada_fin: jornadaFin,
});

        alert("Empleado creado correctamente.");
      } else {
       await updateEmployee({
  id: employee.id,
  nombre,
  apellido,
  email,
  password,
  cargo,
  rubro,
  jornada_inicio: jornadaInicio,
  jornada_fin: jornadaFin,
});
        alert("Empleado actualizado correctamente.");
      }

      onClose();
    } catch (err) {
      console.error(err);

      alert(
        mode === "create"
          ? "No se pudo crear el empleado."
          : "No se pudo actualizar el empleado."
      );
    } finally {
      setLoading(false);
    }
  }

return (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-w-xl md:rounded-3xl"
        >
          {/* HEADER */}

          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10">
                  <User className="h-6 w-6 text-brand" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === "create"
                    ? "Nuevo empleado"
                    : "Editar empleado"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Completa la información del empleado.
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-xl p-2 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* BODY */}

          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">

            {/* INFORMACIÓN PERSONAL */}

            <section>
              <div className="mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-brand" />
                <h3 className="font-semibold text-gray-900">
                  Información personal
                </h3>
              </div>

              <div className="space-y-4">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nombre
                  </label>

                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Apellido
                  </label>

                  <input
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <ShieldCheck className="h-4 w-4" />
                    {mode === "create"
                      ? "Contraseña"
                      : "Nueva contraseña"}
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "edit"
                        ? "Opcional"
                        : ""
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                  />
                </div>

              </div>
            </section>

            {/* INFORMACIÓN LABORAL */}

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-brand" />
                <h3 className="font-semibold text-gray-900">
                  Información laboral
                </h3>
              </div>

              <div className="space-y-4">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Rubro
                  </label>

                  <input
                    value={rubro}
                    onChange={(e) => setRubro(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Cargo
                  </label>

                  <input
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                  />
                </div>

              </div>
            </section>

            {/* HORARIO */}

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-brand" />
                <h3 className="font-semibold text-gray-900">
                  Jornada laboral
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Entrada
                  </label>

                  <input
                    type="time"
                    value={jornadaInicio}
                    onChange={(e) =>
                      setJornadaInicio(e.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Salida
                  </label>

                  <input
                    type="time"
                    value={jornadaFin}
                    onChange={(e) =>
                      setJornadaFin(e.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                  />
                </div>

              </div>
            </section>

          </div>

          {/* FOOTER */}

          <div className="border-t border-gray-100 p-6">
            <button
              onClick={handleSaveEmployee}
              disabled={loading}
              className="w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {loading
                ? mode === "create"
                  ? "Creando empleado..."
                  : "Guardando cambios..."
                : mode === "create"
                ? "Crear empleado"
                : "Guardar cambios"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);}