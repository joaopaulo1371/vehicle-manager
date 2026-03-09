import { defineBoot } from '#q-app/wrappers';
import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from 'src/stores/auth-store';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  withCredentials: true,
});

export default defineBoot(({ app, router, store }) => {
  const authStore = useAuthStore(store);
  authStore.restoreSession();

  api.interceptors.request.use((config) => {
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };
      const originalRequest = error.config as RetryConfig | undefined;

      const isUnauthorized = error.response?.status === 401;
      const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');
      if (isUnauthorized && originalRequest && !originalRequest._retry && !isRefreshEndpoint) {
        originalRequest._retry = true;
        const token = await authStore.refreshSession();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api.request(originalRequest);
        }
        await router.push('/login');
      }
      return Promise.reject(
        error instanceof Error ? error : new Error('Falha na requisição'),
      );
    },
  );

  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
