export interface IProduct {
  description: string;
  id: number;
  price: number;
  title: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export type TProducts = IProduct[];
