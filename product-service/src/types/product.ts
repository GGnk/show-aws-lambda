export interface IProduct {
  id: string;
  description: string;
  price: number;
  title: string;
  category: string;
  image: string;
  rating: {
    rate: number;
  };
}

export type TProducts = IProduct[];

export interface IProductStock {
  product_id: string;
  count: number;
}

export type TProductsStock = IProductStock[];

export interface IProductWithStock extends Omit<IProduct, 'rating'> {
  rating: {
    rate: number;
    count: IProductStock['count'];
  };
}
