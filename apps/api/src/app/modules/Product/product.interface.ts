export type IProduct = {
  name: string;
  categoryId: string;
  price: number;
  stockQuantity: number;
  minStockThreshold: number;
  userId: string;
};

export type GetProductsParams = {
  userId: string;
  search?: string;
  categoryId?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
};
