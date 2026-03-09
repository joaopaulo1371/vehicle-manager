import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from 'src/stores/auth-store';

const { loginMock, registerMock, refreshMock, logoutMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  registerMock: vi.fn(),
  refreshMock: vi.fn(),
  logoutMock: vi.fn(),
}));

vi.mock('src/services/auth.service', () => ({
  login: loginMock,
  register: registerMock,
  refresh: refreshMock,
  logout: logoutMock,
}));

describe('auth-store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('salva sessao no login', async () => {
    const store = useAuthStore();
    loginMock.mockResolvedValue({
      data: {
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        user: { id: 'u1', name: 'John', email: 'john@doe.com', role: 'USER' },
      },
    });

    await store.login('john@doe.com', '123456');

    expect(store.isAuthenticated).toBe(true);
    expect(store.accessToken).toBe('access-1');
    expect(localStorage.getItem('vehicle-manager-auth')).toContain('access-1');
  });

  it('limpa sessao ao falhar refresh', async () => {
    const store = useAuthStore();
    localStorage.setItem(
      'vehicle-manager-auth',
      JSON.stringify({
        accessToken: 'old-access',
        refreshToken: 'old-refresh',
        user: { id: 'u1', name: 'John', email: 'john@doe.com', role: 'USER' },
      }),
    );
    store.restoreSession();

    refreshMock.mockRejectedValue(new Error('expired'));

    const token = await store.refreshSession();

    expect(token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(localStorage.getItem('vehicle-manager-auth')).toBeNull();
  });

  it('logout sempre limpa sessao', async () => {
    const store = useAuthStore();
    registerMock.mockResolvedValue({
      data: {
        accessToken: 'access-2',
        refreshToken: 'refresh-2',
        user: { id: 'u2', name: 'Mary', email: 'mary@doe.com', role: 'USER' },
      },
    });
    await store.register('Mary', 'mary@doe.com', '123456');

    logoutMock.mockRejectedValue(new Error('network'));

    await store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(localStorage.getItem('vehicle-manager-auth')).toBeNull();
  });
});
