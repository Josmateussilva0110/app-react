import { useState } from "react";

export type Priority =
  | "alta"
  | "media"
  | "baixa";

export type Status = 'pendente' | 'finalizado';

export type Product = {
  id: string;
  nome: string;
  preco: number;
  prioridade: Priority;
  status: Status;
  cadastradoPor: string;
};

const mockProducts: Product[] = [
  {
    id: "1",
    nome: "Notebook",
    preco: 3500,
    prioridade: "alta",
    status: "pendente",
    cadastradoPor: "Mateus",
  },

  {
    id: "4",
    nome: "Teste",
    preco: 2500,
    prioridade: "alta",
    status: "finalizado",
    cadastradoPor: "Mateus",
  },

  {
    id: "2",
    nome: "Teclado",
    preco: 250,
    prioridade: "media",
    status: "finalizado",
    cadastradoPor: "Mateus",
  },

  {
    id: "3",
    nome: "Mouse Pad",
    preco: 80,
    prioridade: "baixa",
    status: "finalizado",
    cadastradoPor: "Mateus",
  },
];

export function useProducts(): Product[] {
  const [products] =
    useState<Product[]>(mockProducts);

  return products;
}

export function formatBRL(
  value: number
): string {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(value);
}