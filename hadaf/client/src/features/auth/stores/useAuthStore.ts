import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string, roles: string[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, email: string, roles: string[]) => {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const name = payload.sub || email.split('@')[0]; 

          const user: User = { name, email, roles };

          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true });
        } catch (e) {
          console.error("Failed to decode token", e);
          // Fallback if decoding fails
          const user: User = { name: email, email, roles: [] };
          set({ user, token, isAuthenticated: true });
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);