import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { EmployeeDashboardPage } from './pages/EmployeeDashboardPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { EmployeesPage } from "./pages/EmployeesPage";

function PrivateRoute({ children }: { children: ReactElement }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/empleado"
        element={
          <PrivateRoute>
            <EmployeeDashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminDashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/empleados"
        element={
          <PrivateRoute>
            <EmployeesPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}