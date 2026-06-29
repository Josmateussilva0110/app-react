import { Router } from "express"
import UserController from "../controllers/userController"
import { validate } from "../middleware/validate"
import { RegisterSchema } from "../schemas/registerSchema"
import { LoginSchema } from "../schemas/loginSchema"
import { UpdateProfileSchema } from "../schemas/updateProfileSchema"
import { loginRateLimiter } from "../middleware/loginRateLimit"
import { authMiddleware } from "../middleware/auth"


const router = Router()


router.post("/register", loginRateLimiter, validate(RegisterSchema), UserController.register)
router.post("/login", loginRateLimiter, validate(LoginSchema), UserController.login)
router.get("/profile", authMiddleware, UserController.getProfile)
router.put("/profile", authMiddleware, validate(UpdateProfileSchema), UserController.updateProfile)
router.post("/logout", authMiddleware, UserController.logout)
router.post("/auth/refresh", loginRateLimiter, UserController.refresh.bind(UserController))


export default router

