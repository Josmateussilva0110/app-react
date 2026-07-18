import { User } from "@supabase/supabase-js"
import type { ProductScope } from "../../utils/productScope"

declare global {
  namespace Express {
    interface Request {
      user: User
      accessToken: string
      scope: ProductScope
    }
  }
}
