import { Router } from "express"
import { validate } from "../middleware/validate"
import ParkingController from "../controllers/parkingController"
import { ParkingRegisterSchema } from "../schemas/parkingSchema"
import { IdParamSchema } from "../schemas/IdParamSchema"
import { UserIdParamSchema } from "../schemas/userIdSchema"
import { ensureAuthenticated } from "../middleware/ensureAuthenticated"


const router = Router()


router.post("/parking/register", validate(ParkingRegisterSchema), ensureAuthenticated, ParkingController.register)
router.get("/parking/list/:id", validate(IdParamSchema, "params"), ensureAuthenticated, ParkingController.list)
router.delete("/parking/:id", validate(IdParamSchema, "params"), ensureAuthenticated, ParkingController.remove)
router.get("/parking/:id", validate(IdParamSchema, "params"), ensureAuthenticated, ParkingController.getParking)
router.put("/parking/:id", validate(IdParamSchema, "params"), ensureAuthenticated, ParkingController.edit)
router.get("/parking/names/:user_id", validate(UserIdParamSchema, "params"), ensureAuthenticated, ParkingController.getParkingNames)

export default router
