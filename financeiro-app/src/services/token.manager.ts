type OnRefreshedCallback = (
  accessToken: string,
  refreshToken: string,
  expiresAt: number
) => void;

type OnExpiredCallback = () => void;

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

const _onRefreshedListeners = new Set<OnRefreshedCallback>();
const _onExpiredListeners = new Set<OnExpiredCallback>();

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

  // Retorna a função de unsubscribe — segue o padrão useEffect(() => {...; return unsub})
  onRefreshed(cb: OnRefreshedCallback): () => void {
    _onRefreshedListeners.add(cb);
    return () => _onRefreshedListeners.delete(cb);
  },

  onExpired(cb: OnExpiredCallback): () => void {
    _onExpiredListeners.add(cb);
    return () => _onExpiredListeners.delete(cb);
  },

  // Chamado pelos interceptors
  notifyRefreshed(access: string, refresh: string, expiresAt: number) {
    _onRefreshedListeners.forEach((cb) => cb(access, refresh, expiresAt));
  },

  notifyExpired() {
    _onExpiredListeners.forEach((cb) => cb());
  },
};