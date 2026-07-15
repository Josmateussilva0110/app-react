import { Router } from "express"
import GoalController from "../controllers/goalController"
import { authMiddleware } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { goalSchema } from "@app/shared"

const router = Router()

router.get("/goal", authMiddleware, GoalController.get)
router.put("/goal", authMiddleware, validate(goalSchema), GoalController.update)

export default router
