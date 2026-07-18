import { Router } from "express"
import { authMiddleware } from "../middleware/auth"
import GroupController from "../controllers/groupController"

const router = Router()

router.get("/groups/me", authMiddleware, GroupController.getMe)
router.post("/groups", authMiddleware, GroupController.create)
router.patch("/groups", authMiddleware, GroupController.update)
router.post("/groups/invites", authMiddleware, GroupController.createInvite)
router.post("/groups/join", authMiddleware, GroupController.join)
router.post("/groups/leave", authMiddleware, GroupController.leave)

export default router
