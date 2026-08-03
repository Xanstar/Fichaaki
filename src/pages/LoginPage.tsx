import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'

export function LoginPage() {
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const user = await login(email, password)
    if (user) navigate(user.rol === 'admin' ? '/admin' : '/empleado')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          <Logo />
        </div>

        <div className="mt-8 rounded-3xl border border-border-subtle bg-surface p-8 shadow-sm shadow-ink/[0.03]">
          <h1 className="font-display text-xl font-bold text-ink">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-ink-soft">Registrá tu jornada en segundos.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.nombre@empresa.com"
                className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-ink
                  placeholder:text-ink-soft/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-ink
                  placeholder:text-ink-soft/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-danger">{error}</p>
            )}

            <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
              Iniciar sesión
            </Button>
          </form>

        
        </div>

        <p className="mt-6 text-center text-xs text-ink-soft">
          FichAKI - 2026
        </p>
      </div>
    </div>
  )
}
