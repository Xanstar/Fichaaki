import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { EmployeeDashboardPage } from './pages/EmployeeDashboardPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { SucursalesPage } from './pages/SucursalesPage'
import { TurnosPage } from './pages/TurnosPage'
import { LicenciasAdminPage } from './pages/LicenciasAdminPage'
import { LicenciasEmpleadoPage } from './pages/LicenciasEmpleadoPage'
import { useEffect, useState } from 'react'
import { SplashScreen } from './components/splash/SplashScreen'
import type { UserRole } from './types'

function PrivateRoute({ role, children }: { role?: UserRole; children: ReactElement }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.rol !== role) {
    return <Navigate to={user.rol === 'admin' ? '/admin' : '/empleado'} replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/empleado"
        element={
          <PrivateRoute role="employee">
            <EmployeeDashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/empleado/licencias"
        element={
          <PrivateRoute role="employee">
            <LicenciasEmpleadoPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <AdminDashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/empleados"
        element={
          <PrivateRoute role="admin">
            <EmployeesPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/sucursales"
        element={
          <PrivateRoute role="admin">
            <SucursalesPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/turnos"
        element={
          <PrivateRoute role="admin">
            <TurnosPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/licencias"
        element={
          <PrivateRoute role="admin">
            <LicenciasAdminPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
