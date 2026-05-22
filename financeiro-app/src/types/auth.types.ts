export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
