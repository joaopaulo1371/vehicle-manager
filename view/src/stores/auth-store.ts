import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { AuthResponse, AuthUser } from 'src/types/auth';
import * as authService from 'src/services/auth.service';

const STORAGE_KEY = 'vehicle-manager-auth';

interface AuthStorage {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref('');
  const refreshToken = ref('');
  const user = ref<AuthUser | null>(null);
  const refreshing = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  function saveSession(data: AuthResponse) {
    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;
    user.value = data.user;
    const payload: AuthStorage = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function clearSession() {
    accessToken.value = '';
    refreshToken.value = '';
    user.value = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  function restoreSession() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const payload = JSON.parse(raw) as AuthStorage;
      accessToken.value = payload.accessToken;
      refreshToken.value = payload.refreshToken;
      user.value = payload.user;
    } catch {
      clearSession();
    }
  }

  async function login(email: string, password: string) {
    const { data } = await authService.login({ email, password });
    saveSession(data);
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await authService.register({ name, email, password });
    saveSession(data);
  }

  async function refreshSession() {
    if (refreshing.value || !refreshToken.value) return null;
    try {
      refreshing.value = true;
      const { data } = await authService.refresh(refreshToken.value);
      saveSession(data);
      return data.accessToken;
    } catch {
      clearSession();
      return null;
    } finally {
      refreshing.value = false;
    }
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await authService.logout(refreshToken.value);
      }
    } finally {
      clearSession();
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    register,
    logout,
    restoreSession,
    refreshSession,
    clearSession,
  };
});
