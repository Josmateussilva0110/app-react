import { Router } from "express"
const router = Router()


import userRoutes from "./userRoutes"
import productRoutes from "./productRoutes"


router.use(userRoutes)
router.use(productRoutes)


export default router
