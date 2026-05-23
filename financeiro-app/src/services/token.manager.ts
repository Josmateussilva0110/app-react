type OnRefreshedCallback = (
  accessToken: string,
  refreshToken: string,
  expiresAt: number
) => void;

type OnExpiredCallback = () => void;

let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _onRefreshed: OnRefreshedCallback | null = null;
let _onExpired: OnExpiredCallback | null = null;

export const tokenManager = {
  getAccessToken: () => _accessToken,
  getRefreshToken: () => _refreshToken,

  setTokens(access: string, refresh: string) {
    _accessToken = access;
    _refreshToken = refresh;
  },

  clearTokens() {
    _accessToken = null;
    _refreshToken = null;
  },

  // Registrado pelo AuthContext na inicialização
  onRefreshed(cb: OnRefreshedCallback) {
    _onRefreshed = cb;
  },

  onExpired(cb: OnExpiredCallback) {
    _onExpired = cb;
  },

  // Chamado pelos interceptors
  notifyRefreshed(access: string, refresh: string, expiresAt: number) {
    _onRefreshed?.(access, refresh, expiresAt);
  },

  notifyExpired() {
    _onExpired?.();
  },
};