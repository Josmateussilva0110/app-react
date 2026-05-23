export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp em ms
}

