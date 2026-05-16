import { Router } from "express"
import UserController from "../controllers/userController"
import { validate } from "../middleware/validate"
import { RegisterSchema } from "../schemas/registerSchema"
import { LoginSchema } from "../schemas/loginSchema"
import { IdParamSchema } from "../schemas/IdParamSchema"
import { ensureAuthenticated } from "../middleware/ensureAuthenticated"


const router = Router()


router.post("/register", validate(RegisterSchema), UserController.register)
router.post("/login", validate(LoginSchema), UserController.login)
router.get("/user/session", UserController.session)
router.post("/user/logout", UserController.logout)
router.get("/user/:id", validate(IdParamSchema, "params"), ensureAuthenticated, UserController.getById)

export default router
