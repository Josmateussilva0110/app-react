import { Router } from "express";
import { productSchema } from "@app/shared"; 
import { validate } from "../middleware/validate";
import ProductController from "../controllers/productController";

const router = Router();

router.post("/product", validate(productSchema), ProductController.create);

export default router;
