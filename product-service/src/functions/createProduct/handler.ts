import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import type { IProduct, IProductStock, IProductWithStock } from 'src/types/product';
import { APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const updateProductsTable = async (product: IProduct) => {
  const command = new PutCommand({
    TableName: process.env.PRODUCTS_TABLE,
    Item: product,
  });

  await docClient.send(command);
};

const updateProductsStockTable = async (product: IProductStock) => {
  const command = new PutCommand({
    TableName: process.env.PRODUCTS_STOCK_TABLE,
    Item: product,
  });

  await docClient.send(command);
};

const checkFieldAndRespond = (
  fieldName: string,
  payload: undefined | string | number,
  callback: (error?: string | Error, result?: APIGatewayProxyResult) => void,
) => {
  if (payload === undefined) {
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Product data is invalid. ${fieldName} is missing` }),
    });
  }
};

const createProduct: ValidatedEventAPIGatewayProxyEvent<any> = async (
  event,
  _context,
  callback,
) => {
  // @ts-ignore
  const payload: IProductWithStock = JSON.parse(event.body);
  checkFieldAndRespond('Description', payload.description, callback);
  checkFieldAndRespond('Price', payload.price, callback);
  checkFieldAndRespond('Category', payload.category, callback);
  checkFieldAndRespond('Rate', payload.rating.rate, callback);
  checkFieldAndRespond('Count', payload.rating.count, callback);

  const productId = uuidv4();
  const product: IProduct = {
    id: productId,
    description: payload.description,
    price: payload.price,
    title: payload.title,
    category: payload.category,
    image: payload.image || '',
    rating: {
      rate: payload.rating.rate,
    },
  };

  const productStockData: IProductStock = {
    product_id: productId,
    count: payload.rating.rate,
  };

  await updateProductsTable(product);
  await updateProductsStockTable(productStockData);

  return formatJSONResponse({
    data: 'Product created with id: ' + productId,
  });
};
export const main = createProduct;
