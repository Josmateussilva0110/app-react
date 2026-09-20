import { Router } from "express";
import { productSchema } from "@app/shared"; 
import { validate } from "../middleware/validate";
import { authMiddleware } from "../middleware/auth";
import { scopeMiddleware } from "../middleware/scopeMiddleware";
import ProductController from "../controllers/productController";
import { productIdParamSchema } from "../types/product/product-id-param";

const router = Router();

router.post("/products", authMiddleware, scopeMiddleware, validate(productSchema), ProductController.create);
router.get("/products/periods", authMiddleware, scopeMiddleware, ProductController.getPeriods);
router.get("/products/stats", authMiddleware, scopeMiddleware, ProductController.getStats);
router.get("/products", authMiddleware, scopeMiddleware, ProductController.getAll);
// Depois de /periods e /stats: registrada antes, ":id" capturaria as duas.
router.get("/products/:id", authMiddleware, scopeMiddleware, validate(productIdParamSchema, "params"), ProductController.getById);
router.put("/products/:id", authMiddleware, scopeMiddleware, validate(productIdParamSchema, "params"), validate(productSchema), ProductController.update);
router.delete("/products/:id", authMiddleware, scopeMiddleware, validate(productIdParamSchema, "params"), ProductController.delete);

export default router;
