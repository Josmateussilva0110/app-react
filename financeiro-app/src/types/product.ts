export type Priority = 'alta' | 'media' | 'baixa';

export interface Product {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  prioridade: Priority;
  criadoEm: string;
  atualizadoEm: string;
}

export type ProductInput = Omit<Product, 'id' | 'criadoEm' | 'atualizadoEm'>;
