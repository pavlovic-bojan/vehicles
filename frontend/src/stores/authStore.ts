import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, type AuthUser } from '../api/auth.api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const user = ref<AuthUser | null>((() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })());

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  function setAuth(t: string, u: AuthUser) {
    token.value = t;
    user.value = u;
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }

  function clearAuth() {
    token.value = null;
    user.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function fetchMe() {
    const { data } = await authApi.getMe();
    user.value = data.data;
    localStorage.setItem(USER_KEY, JSON.stringify(data.data));
    return data.data;
  }

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    clearAuth,
    fetchMe,
  };
});
