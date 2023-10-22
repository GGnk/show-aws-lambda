import { AttributeValue } from '@aws-sdk/client-dynamodb';

export const convertToProductType = (item: Record<string, AttributeValue>) => {
  return {
    id: item.id.S,
    description: item.description.S,
    price: parseInt(item.price.N, 10),
    title: item.title.S,
    category: item.category.S,
    image: item.image.S,
    rating: {
      rate: parseInt(item.rating.M.rate.N, 10),
    },
  };
};

export const convertToProductStockType = (item: Record<string, AttributeValue>) => {
  return {
    product_id: item.product_id.S,
    count: parseInt(item.count.N, 10),
  };
};
