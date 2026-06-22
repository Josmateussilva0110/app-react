import { Router } from "express";
import { productSchema } from "@app/shared"; 
import { validate } from "../middleware/validate";
import { authMiddleware } from "../middleware/auth";
import ProductController from "../controllers/productController";
import { rateLimiter } from "../middleware/rateLimiter";
import { productIdParamSchema } from "../types/product/product-id-param";

const router = Router();

router.post("/products", authMiddleware, validate(productSchema), ProductController.create);
router.get("/products", authMiddleware, rateLimiter, ProductController.getAll);
router.put("/products/:id", authMiddleware, validate(productIdParamSchema, "params"), validate(productSchema), ProductController.update);
router.delete("/products/:id", authMiddleware, validate(productIdParamSchema, "params"), ProductController.delete);

export default router;
