// Só as colunas que as telas leem. `created_at` e `updated_at` saíram daqui:
// ninguém os exibe e eles custavam ~20% do payload de cada página da lista.
export const PRODUCT_SELECT_FIELDS = `
  id,
  name,
  user_id,
  price,
  priority,
  payment_type,
  category,
  date,
  finished,
  month_list
`;
