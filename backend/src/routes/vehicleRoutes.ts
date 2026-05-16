import { Router } from "express"
import vehicleController from "../controllers/vehicleController" 
import { RegisterVehicleSchema } from "../schemas/vehicleSchema"
import { UserIdParamSchema } from "../schemas/userIdSchema"
import { IdParamSchema } from "../schemas/IdParamSchema"
import { validate } from "../middleware/validate"
import { ensureAuthenticated } from "../middleware/ensureAuthenticated"


const router = Router()


router.post("/vehicle/register", validate(RegisterVehicleSchema), ensureAuthenticated, vehicleController.registerVehicle)
router.get("/vehicles/pagination/:user_id", validate(UserIdParamSchema, "params"), ensureAuthenticated, vehicleController.listVehicle)
router.delete("/vehicle/:id", validate(IdParamSchema, "params"), ensureAuthenticated, vehicleController.removeVehicle)
router.get("/vehicle/:id", validate(IdParamSchema, "params"), ensureAuthenticated, vehicleController.getVehicleDetail)
router.put("/vehicle/:id", validate(RegisterVehicleSchema), validate(IdParamSchema, "params"), ensureAuthenticated, vehicleController.editVehicle)


export default router
