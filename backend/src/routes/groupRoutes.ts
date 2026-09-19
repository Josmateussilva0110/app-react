import { Router } from "express"
import { createGroupSchema, joinGroupSchema, updateGroupSchema } from "@app/shared"
import { authMiddleware } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { joinGroupRateLimiter } from "../middleware/joinGroupRateLimit"
import GroupController from "../controllers/groupController"

const router = Router()

router.get("/groups/me", authMiddleware, GroupController.getMe)
router.post("/groups", authMiddleware, validate(createGroupSchema), GroupController.create)
router.patch("/groups", authMiddleware, validate(updateGroupSchema), GroupController.update)
router.post("/groups/invites", authMiddleware, GroupController.createInvite)
router.post(
    "/groups/join",
    joinGroupRateLimiter,
    authMiddleware,
    validate(joinGroupSchema),
    GroupController.join
)
router.post("/groups/leave", authMiddleware, GroupController.leave)

export default router
