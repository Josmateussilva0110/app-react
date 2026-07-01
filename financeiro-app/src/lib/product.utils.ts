import {
  CATEGORIES,
  PAYMENT_TYPES,
} from "@/features/product/constants/product-form.constant";
import type { ProductResponse } from "@app/shared";
import type { ProductFormInput } from "@/schemas/product.schema";

export function formatProductDate(date: string): string {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date;

  const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }

  return date;
}

export function isMonthList(value: boolean | string | undefined): boolean {
  if (typeof value === "boolean") return value;
  return value === "true" || value === "t";
}


export function isFinished(value: boolean | string | undefined): boolean {
  if (typeof value === "boolean") return value;
  return value === "true" || value === "t";
}

export function getPaymentLabel(key: string): string {
  return PAYMENT_TYPES.find((item) => item.key === key)?.label ?? key;
}

export function getCategoryLabel(key: string): string {
  return CATEGORIES.find((item) => item.key === key)?.label ?? key;
}

export function formatPriceForInput(price: number): string {
  return price.toFixed(2).replace(".", ",");
}

export function productToFormValues(product: ProductResponse): ProductFormInput {
  return {
    name: product.name,
    price: formatPriceForInput(product.price),
    priority: product.priority,
    paymentType: product.payment_type,
    category: product.category,
    date: formatProductDate(product.date),
    finished: product.finished,
    monthList: isMonthList(product.month_list),
  };
}
