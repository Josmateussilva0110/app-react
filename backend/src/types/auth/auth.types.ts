export interface AuthTokens {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string | undefined
  }
}
