export type OrderItemInput = {
  productId: string;
  quantity: number;
};

export type ICreateOrder = {
  customerName: string;
  items: OrderItemInput[];
  userId: string;
};

export type GetOrdersParams = {
  userId: string;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  page?: number;
  limit?: number;
};
