import { Router } from "express"
import UserController from "../controllers/userController"
import { validate } from "../middleware/validate"
import { RegisterSchema } from "../schemas/registerSchema"
import { LoginSchema } from "../schemas/loginSchema"
import { loginRateLimiter } from "../middleware/rateLimit"
import { authMiddleware } from "../middleware/auth"


const router = Router()


router.post("/register", validate(RegisterSchema), UserController.register)
router.post("/login", loginRateLimiter, validate(LoginSchema), UserController.login)
router.post("/logout", authMiddleware, UserController.logout)


export default router
