import { Router } from "express"
const router = Router()


import userRoutes from "./userRoutes"
import productRoutes from "./productRoutes"
import goalRoutes from "./goalRoutes"


router.use(userRoutes)
router.use(productRoutes)
router.use(goalRoutes)


export default router
