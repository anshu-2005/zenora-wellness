import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type User = {
  id: string
  name: string
  email: string
  role?: string
}

type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: {
        id: '1',
        name: 'Vikas Sharma',
        email: 'vikas@zenora.app',
        role: 'admin'
      },
      token: 'zenora-demo-token',
      isAuthenticated: true,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'zenora-auth',
    }
  )
)
