import { Router } from "express"
import statsController from "../controllers/statsController"
import { ensureAuthenticated } from "../middleware/ensureAuthenticated"


const router = Router()

router.get("/stats/parking", ensureAuthenticated, statsController.getKpiParking)
router.get("/stats/revenue", ensureAuthenticated, statsController.getRevenue)
router.get("/stats/occupied", ensureAuthenticated, statsController.getOccupied)
router.get("/stats/revenue/day", ensureAuthenticated, statsController.getRevenueByDay)
router.get("/stats/vehicle", ensureAuthenticated, statsController.getVehiclesType)
router.get("/stats/recents", ensureAuthenticated, statsController.getRecentsAllocations)


export default router
