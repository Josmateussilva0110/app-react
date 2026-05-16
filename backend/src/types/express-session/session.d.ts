import "express-session"
import { UserSessionData } from "../session/UserSessionData"

declare module "express-session" {
  interface SessionData {
    user?: UserSessionData
    visits?: number
  }
}
