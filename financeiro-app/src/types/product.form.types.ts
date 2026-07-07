import { z } from "zod";
import { ProductFormData, productFormSchema } from "@/schemas/product.schema";
import { Control } from "react-hook-form";

// Valores ANTES do transform (price é string vinda do input)
export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormControl = Control<ProductFormInput, unknown, ProductFormData>;

// Valores APÓS o transform (price vira number — payload final)
export type { ProductFormData } from "@/schemas/product.schema";
