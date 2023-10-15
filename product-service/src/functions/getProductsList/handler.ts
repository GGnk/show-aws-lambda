import { ValidatedEventAPIGatewayProxyEvent, formatJSONResponse } from '@libs/api-gateway';

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { TProducts, TProductsStock } from 'src/types/product';
import { convertToProductStockType, convertToProductType } from '@libs/convert';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

docClient.middlewareStack;

const productsTable = async () => {
  const command = new ScanCommand({
    TableName: process.env.PRODUCTS_TABLE,
  });

  const result = await docClient.send(command);
  const products: TProducts = result.Items.map((item) => {
    return convertToProductType(item);
  });
  return products;
};

const productsStockTable = async () => {
  const command = new ScanCommand({
    TableName: process.env.PRODUCTS_STOCK_TABLE,
  });

  const result = await docClient.send(command);
  const products: TProductsStock = result.Items.map((item) => {
    return convertToProductStockType(item);
  });
  return products;
};

const getProductsList: ValidatedEventAPIGatewayProxyEvent<any> = async () => {
  const products = await productsTable();
  const productsStock = await productsStockTable();

  const body: TProducts = products.map((product) => {
    const stock = productsStock.find((stock) => stock.product_id === product.id);
    return {
      ...product,
      rating: {
        ...product.rating,
        count: stock?.count,
      },
    };
  });

  return formatJSONResponse(body);
};

export const main = getProductsList;
