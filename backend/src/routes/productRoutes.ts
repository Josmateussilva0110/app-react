import { Router } from "express";
import { productSchema } from "@app/shared"; 
import { validate } from "../middleware/validate";
import { authMiddleware } from "../middleware/auth";
import ProductController from "../controllers/productController";

const router = Router();

router.post("/product", authMiddleware, validate(productSchema), ProductController.create);

export default router;
