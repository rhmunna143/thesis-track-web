import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/auth.service";
import { userService } from "../services/user.service";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.login(credentials);

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          return { success: true, user: response.user };
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: error.message || "Login failed",
          });
          return { success: false, error: error.message || "Login failed" };
        }
      },

      signup: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.signup(userData);

          set({
            loading: false,
            error: null,
          });

          return { success: true, user: response };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Signup failed",
          });
          return { success: false, error: error.message || "Signup failed" };
        }
      },

      adminRegister: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.adminRegister(userData);

          set({
            loading: false,
            error: null,
          });

          return { success: true, user: response };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "User registration failed",
          });
          return {
            success: false,
            error: error.message || "User registration failed",
          };
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      getCurrentUser: async () => {
        const { token, isAuthenticated } = get();
        if (!token || !isAuthenticated) return null;


        set({ loading: true, error: null });
        try {
          const user = await authService.getCurrentUser();

          set({
            user: user,
            loading: false,
            error: null,
          });

          return user;
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: error.message || "Failed to get user",
          });
          return null;
        }
      },

      updateProfile: async (updatedData) => {
        set({ loading: true, error: null });
        try {
          const response = await userService.updateProfile(updatedData);
          const currentUser = get().user;

          set({
            user: { ...currentUser, ...response },
            loading: false,
            error: null,
          });

          return { success: true, user: response };
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Profile update failed",
          });
          return {
            success: false,
            error: error.message || "Profile update failed",
          };
        }
      },

      getProfile: async () => {
        set({ loading: true, error: null });
        try {
          const profile = await userService.getProfile();

          set({
            user: { ...get().user, ...profile },
            loading: false,
            error: null,
          });

          return profile;
        } catch (error) {
          set({
            loading: false,
            error: error.message || "Failed to get profile",
          });
          throw error;
        }
      },

      verifyToken: async () => {
        const { token } = get();
        if (!token) return false;

        try {
          const user = await authService.verifyToken();

          set({
            user: user,
            isAuthenticated: true,
            error: null,
          });

          return true;
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
          return false;
        }
      },

      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
      },

      clearError: () => {
        set({ error: null });
      },

      // Helper methods
      isAdmin: () => {
        return get().user?.role === "ADMIN";
      },

      isTeacher: () => {
        return get().user?.role === "TEACHER";
      },

      isStudent: () => {
        return get().user?.role === "STUDENT";
      },

      hasRole: (role) => {
        return get().user?.role === role;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
