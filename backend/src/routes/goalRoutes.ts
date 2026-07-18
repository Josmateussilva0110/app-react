import { Router } from "express"
import GoalController from "../controllers/goalController"
import { authMiddleware } from "../middleware/auth"
import { scopeMiddleware } from "../middleware/scopeMiddleware"
import { validate } from "../middleware/validate"
import { goalSchema } from "@app/shared"

const router = Router()

router.get("/goal", authMiddleware, scopeMiddleware, GoalController.get)
router.put("/goal", authMiddleware, scopeMiddleware, validate(goalSchema), GoalController.update)

export default router
