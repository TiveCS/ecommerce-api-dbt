export type GetProductsModelType = {
  id: string;
  title: string;
  sold: number;
  price: number;
  thumbnailUrl: string | null;
};

export type GetProductsResponse = GetProductsModelType[];
