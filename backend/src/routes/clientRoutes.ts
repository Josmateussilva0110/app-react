import { Router } from "express"
import ClientController from "../controllers/clientController"
import { RegisterClientSchema } from "../schemas/clientSchema"
import { UserIdParamSchema } from "../schemas/userIdSchema"
import { IdParamSchema } from "../schemas/IdParamSchema"
import { validate } from "../middleware/validate"
import { ensureAuthenticated } from "../middleware/ensureAuthenticated"


const router = Router()


router.post("/client/register", validate(RegisterClientSchema), ensureAuthenticated, ClientController.register)
router.get("/clients/:user_id", validate(UserIdParamSchema, "params"), ensureAuthenticated, ClientController.getClients)
router.get("/clients/vehicle/:user_id", validate(UserIdParamSchema, "params"), ensureAuthenticated, ClientController.getClientAndVehicle)
router.get("/clients/pagination/:user_id", validate(UserIdParamSchema, "params"), ensureAuthenticated, ClientController.listClients)
router.get("/client/:id", validate(IdParamSchema, "params"), ensureAuthenticated, ClientController.getById)
router.delete("/client/:id", validate(IdParamSchema, "params"), ensureAuthenticated, ClientController.remove)
router.put("/client/:id", validate(RegisterClientSchema), validate(IdParamSchema, "params"), ensureAuthenticated, ClientController.edit)



export default router
