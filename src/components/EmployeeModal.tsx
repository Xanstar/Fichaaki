import { useEffect, useState } from 'react'
import { createEmployee, updateEmployee } from '../services/employeeService'
import { AnimatePresence, motion } from 'framer-motion'
import { Briefcase, Clock3, KeyRound, MapPin, User, X } from 'lucide-react'
import type { Sucursal, Turno } from '../types'

interface EmployeeForm {
  id: string
  nombre: string
  apellido: string
  email: string
  rubro: string
  cargo: string
  jornada_inicio: string
  jornada_fin: string
  sucursal_id?: string | null
  turno_id?: string | null
  pin?: string | null
}

type Props = {
  open: boolean
  onClose: () => void
  mode?: 'create' | 'edit'
  employee?: EmployeeForm | null
  sucursales?: Sucursal[]
  turnos?: Turno[]
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

const inputClasses =
  'w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10'

export function EmployeeModal({
  open,
  onClose,
  mode = 'create',
  employee,
  sucursales = [],
  turnos = [],
  onSuccess,
  onError,
}: Props) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rubro, setRubro] = useState('')
  const [cargo, setCargo] = useState('')
  const [jornadaInicio, setJornadaInicio] = useState('')
  const [jornadaFin, setJornadaFin] = useState('')
  const [sucursalId, setSucursalId] = useState('')
  const [turnoId, setTurnoId] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setNombre(employee?.nombre ?? '')
      setApellido(employee?.apellido ?? '')
      setEmail(employee?.email ?? '')
      setRubro(employee?.rubro ?? '')
      setCargo(employee?.cargo ?? '')
      setJornadaInicio(employee?.jornada_inicio ?? '')
      setJornadaFin(employee?.jornada_fin ?? '')
      setSucursalId(employee?.sucursal_id ?? '')
      setTurnoId(employee?.turno_id ?? '')
      setPin(employee?.pin ?? '')
      setPassword('')
      setError('')
    }
  }, [employee, mode, open])

  function handleTurnoChange(value: string) {
    setTurnoId(value)
    const turno = turnos.find((item) => item.id === value)
    if (turno) {
      setJornadaInicio(turno.jornada_inicio)
      setJornadaFin(turno.jornada_fin)
    }
  }

  async function handleSaveEmployee() {
    if (!nombre || !apellido || !email || !cargo || !jornadaInicio || !jornadaFin) {
      setError('Completá todos los campos obligatorios.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const common = {
        cargo,
        rubro,
        jornada_inicio: jornadaInicio,
        jornada_fin: jornadaFin,
        sucursal_id: sucursalId || null,
        turno_id: turnoId || null,
        pin: pin || null,
      }

      if (mode === 'create') {
        if (!password) {
          setError('La contraseña es obligatoria.')
          return
        }

        await createEmployee({
          nombre,
          apellido,
          email,
          password,
          ...common,
        })

        onSuccess?.('Empleado creado correctamente.')
      } else {
        await updateEmployee({
          id: employee!.id,
          nombre,
          apellido,
          email,
          password: password || undefined,
          ...common,
        })

        onSuccess?.('Empleado actualizado correctamente.')
      }

      onClose()
    } catch (err) {
      console.error(err)
      const message =
        err instanceof Error ? err.message : 'No se pudo guardar el empleado.'
      setError(message)
      onError?.(message)
    } finally {
      setLoading(false)
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm md:items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl md:max-w-xl md:rounded-3xl"
          >
            <div className="border-b border-border-subtle px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10">
                    <User className="h-6 w-6 text-brand" />
                  </div>

                  <h2 className="text-2xl font-bold text-ink">
                    {mode === 'create' ? 'Nuevo empleado' : 'Editar empleado'}
                  </h2>

                  <p className="mt-1 text-sm text-ink-soft">
                    Completa la información del empleado.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-xl p-2 text-ink-soft transition hover:bg-surface-muted"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-brand" />
                  <h3 className="font-semibold text-ink">Información personal</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Nombre</label>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClasses} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Apellido</label>
                    <input value={apellido} onChange={(e) => setApellido(e.target.value)} className={inputClasses} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                      {mode === 'create' ? 'Contraseña' : 'Nueva contraseña'}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'edit' ? 'Opcional' : ''}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-brand" />
                  <h3 className="font-semibold text-ink">Información laboral</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Rubro</label>
                    <input value={rubro} onChange={(e) => setRubro(e.target.value)} className={inputClasses} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Cargo</label>
                    <input value={cargo} onChange={(e) => setCargo(e.target.value)} className={inputClasses} />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand" />
                  <h3 className="font-semibold text-ink">Sucursal y turno</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                      Sucursal
                    </label>
                    <select
                      value={sucursalId}
                      onChange={(e) => setSucursalId(e.target.value)}
                      className={inputClasses}
                    >
                      <option value="">Sin sucursal asignada</option>
                      {sucursales.map((sucursal) => (
                        <option key={sucursal.id} value={sucursal.id}>
                          {sucursal.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                      Turno
                    </label>
                    <select
                      value={turnoId}
                      onChange={(e) => handleTurnoChange(e.target.value)}
                      className={inputClasses}
                    >
                      <option value="">Turno personalizado</option>
                      {turnos.map((turno) => (
                        <option key={turno.id} value={turno.id}>
                          {turno.nombre} ({turno.jornada_inicio} - {turno.jornada_fin})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-brand" />
                  <h3 className="font-semibold text-ink">Jornada laboral</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Entrada</label>
                    <input
                      type="time"
                      value={jornadaInicio}
                      onChange={(e) => setJornadaInicio(e.target.value)}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Salida</label>
                    <input
                      type="time"
                      value={jornadaFin}
                      onChange={(e) => setJornadaFin(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
                    <KeyRound className="h-4 w-4 text-brand" />
                    PIN de fichaje (opcional)
                  </label>
                  <input
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Ej: 1234"
                    maxLength={8}
                    className={inputClasses}
                  />
                  <p className="mt-2 text-xs text-ink-soft">
                    Si asignás un PIN, el empleado podrá fichar con el código de la
                    sucursal + PIN en vez de GPS.
                  </p>
                </div>
              </section>
            </div>

            {error && (
              <div className="px-6 pb-4">
                <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
                  {error}
                </p>
              </div>
            )}

            <div className="border-t border-border-subtle p-6">
              <button
                onClick={handleSaveEmployee}
                disabled={loading}
                className="w-full rounded-2xl bg-brand py-4 text-base font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              >
                {loading
                  ? mode === 'create'
                    ? 'Creando empleado...'
                    : 'Guardando cambios...'
                  : mode === 'create'
                    ? 'Crear empleado'
                    : 'Guardar cambios'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
