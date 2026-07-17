import { Router } from "express"
const router = Router()


import userRoutes from "./userRoutes"
import productRoutes from "./productRoutes"
import goalRoutes from "./goalRoutes"
import groupRoutes from "./groupRoutes"


router.use(userRoutes)
router.use(productRoutes)
router.use(goalRoutes)
router.use(groupRoutes)


export default router
