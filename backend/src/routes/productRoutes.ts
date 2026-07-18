import { Router } from "express";
import { productSchema } from "@app/shared"; 
import { validate } from "../middleware/validate";
import { authMiddleware } from "../middleware/auth";
import { scopeMiddleware } from "../middleware/scopeMiddleware";
import ProductController from "../controllers/productController";
import { productIdParamSchema } from "../types/product/product-id-param";

const router = Router();

router.post("/products", authMiddleware, scopeMiddleware, validate(productSchema), ProductController.create);
router.get("/products/stats", authMiddleware, scopeMiddleware, ProductController.getStats);
router.get("/products", authMiddleware, scopeMiddleware, ProductController.getAll);
router.put("/products/:id", authMiddleware, validate(productIdParamSchema, "params"), validate(productSchema), ProductController.update);
router.delete("/products/:id", authMiddleware, validate(productIdParamSchema, "params"), ProductController.delete);

export default router;
