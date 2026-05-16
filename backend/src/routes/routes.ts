import { Router } from "express"
const router = Router()


import userRoutes from "./userRoutes"
import parkingRoutes from "./parkingRoutes"
import clientRoutes from "./clientRoutes"
import vehicleRoutes from "./vehicleRoutes"
import allocationRoutes from "./allocationRoutes"
import statsRoutes from "./statsRoutes"

router.use(userRoutes)
router.use(parkingRoutes)
router.use(clientRoutes)
router.use(allocationRoutes)
router.use(vehicleRoutes)
router.use(statsRoutes)

export default router
