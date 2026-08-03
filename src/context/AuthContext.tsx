import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types'
import { supabase } from '../services/supabase'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthUser | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function toAuthUser(profile: { id: string; nombre: string; apellido: string; email: string; rol: 'admin' | 'employee'; rubro: string }): AuthUser {
  return { id: profile.id, nombre: profile.nombre, apellido: profile.apellido, email: profile.email, cargo: profile.rubro, rol: profile.rol, companyId: 'default' }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadProfile(userId: string) {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, nombre, apellido, email, rol, rubro')
      .eq('id', userId)
      .single()
    if (profileError || !data) throw new Error('No se encontró el perfil de usuario.')
    return toAuthUser(data)
  }

useEffect(() => {
  let active = true;

  async function restoreSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!active) return;

    if (!session) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await loadProfile(session.user.id);

      if (active) {
        setUser(profile);
      }
    } catch {
      if (active) {
        setError("No se pudo cargar tu perfil.");
      }
    } finally {
      if (active) {
        setIsLoading(false);
      }
    }
  }

  restoreSession();

  const { data: subscription } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (!active) return;

      if (!session) {
        setUser(null);
        return;
      }

      try {
        const profile = await loadProfile(session.user.id);
        setUser(profile);
      } catch {
        setError("No se pudo cargar tu perfil.");
      }
    }
  );

  return () => {
    active = false;
    subscription.subscription.unsubscribe();
  };
}, []);

  async function login(email: string, password: string) {
    setIsLoading(true)
    setError(null)
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError || !data.user) {
      setError('Email o contraseña incorrectos.')
      setIsLoading(false)
      return null
    }
    try {
      const profile = await loadProfile(data.user.id)
      setUser(profile)
      return profile
    } catch {
      setError('Tu cuenta no tiene un perfil habilitado.')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
