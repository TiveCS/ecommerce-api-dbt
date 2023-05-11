export type GetProductResponse = {
  title: string;
  price: number;
  description: string;
  sold: number;
  stocks: number;
  merchant: {
    name: string;
    phone: string;
  };
  images: string[];
};
