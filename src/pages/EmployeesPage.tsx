import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Pencil, Plus, Users } from 'lucide-react'
import { EmployeeModal } from '../components/EmployeeModal'
import { getEmployees } from '../services/employeeService'
import { getSucursales } from '../services/sucursalesService'
import { getTurnos } from '../services/turnosService'
import { ToastContainer } from '../components/Toast'
import { useToasts } from '../hooks/useToasts'
import type { Sucursal, Turno } from '../types'

interface Employee {
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

export function EmployeesPage() {
  const navigate = useNavigate()
  const { toasts, push, dismiss } = useToasts()

  const [openModal, setOpenModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [turnos, setTurnos] = useState<Turno[]>([])

  async function loadEmployees() {
    try {
      setEmployees(await getEmployees())
    } catch (err) {
      console.error(err)
    }
  }

  async function loadConfig() {
    try {
      const [sucursalList, turnoList] = await Promise.all([getSucursales(), getTurnos()])
      setSucursales(sucursalList)
      setTurnos(turnoList)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadEmployees()
    loadConfig()
  }, [])

  function sucursalNombre(id?: string | null) {
    return sucursales.find((sucursal) => sucursal.id === id)?.nombre
  }

  function turnoNombre(id?: string | null) {
    return turnos.find((turno) => turno.id === id)?.nombre
  }

  function openCreate() {
    setSelectedEmployee(null)
    setModalMode('create')
    setOpenModal(true)
  }

  function openEdit(employee: Employee) {
    setSelectedEmployee(employee)
    setModalMode('edit')
    setOpenModal(true)
  }

  return (
    <>
      <div className="min-h-screen bg-surface-muted">
        <header className="border-b border-border-subtle bg-surface">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="rounded-xl border border-border-subtle p-2 text-ink hover:bg-surface-muted"
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-ink">Gestión de empleados</h1>
                <p className="text-sm text-ink-soft">
                  Administra todos los empleados del sistema.
                </p>
              </div>
            </div>

            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-white transition hover:opacity-90"
            >
              <Plus size={18} />
              Agregar empleado
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-5">
          {employees.length === 0 ? (
            <div className="rounded-3xl border border-border-subtle bg-surface p-10 text-center shadow-sm">
              <Users size={70} className="mx-auto mb-5 text-brand" />

              <h2 className="text-xl font-semibold text-ink">
                Todavía no hay empleados
              </h2>

              <p className="mt-2 text-ink-soft">
                Cuando agregues empleados aparecerán aquí.
              </p>

              <button
                onClick={openCreate}
                className="mt-8 rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:opacity-90"
              >
                + Agregar empleado
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-ink">
                      {employee.nombre} {employee.apellido}
                    </h3>

                    <p className="text-sm text-ink-soft">
                      {employee.cargo || employee.rubro || 'Sin cargo'}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink-soft">
                      <span className="rounded-full bg-surface-muted px-2 py-1">
                        {employee.jornada_inicio} - {employee.jornada_fin}
                      </span>
                      {employee.turno_id && (
                        <span className="rounded-full bg-brand-soft px-2 py-1 font-medium text-brand">
                          Turno: {turnoNombre(employee.turno_id)}
                        </span>
                      )}
                      {employee.sucursal_id && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-1">
                          <MapPin size={12} />
                          {sucursalNombre(employee.sucursal_id)}
                        </span>
                      )}
                      {employee.pin && (
                        <span className="rounded-full bg-surface-muted px-2 py-1">
                          PIN: {employee.pin}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openEdit(employee)}
                    className="flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-ink transition hover:bg-surface-muted"
                  >
                    <Pencil size={18} />
                    Editar
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} onClose={dismiss} />

      <EmployeeModal
        open={openModal}
        mode={modalMode}
        employee={selectedEmployee}
        sucursales={sucursales}
        turnos={turnos}
        onSuccess={(message) => {
          push('success', message)
          setOpenModal(false)
          setSelectedEmployee(null)
          loadEmployees()
        }}
        onError={(message) => push('error', message)}
        onClose={() => {
          setOpenModal(false)
          setSelectedEmployee(null)
        }}
      />
    </>
  )
}
