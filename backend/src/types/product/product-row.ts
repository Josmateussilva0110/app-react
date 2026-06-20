export interface ProductRow {
  id: string;
  user_id: string;
  name: string;
  price: number;
  priority: "alta" | "média" | "baixa";
  payment_type: string;
  category: string;
  date: string;
  finished: boolean;
  month_list: string;
  created_at: string;
  updated_at: string;
}
