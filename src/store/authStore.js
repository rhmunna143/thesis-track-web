import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: {
        id: 1,
        name: 'Demo User',
        email: 'demo@university.edu',
        role: 'STUDENT'
      },
      token: 'mock-jwt-token',
      isAuthenticated: true,
      
      login: (userData, token) => {
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
        })
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
      
      updateProfile: (updatedData) => {
        const currentUser = get().user
        set({
          user: { ...currentUser, ...updatedData },
        })
      },
      
      setToken: (token) => {
        set({ token })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore