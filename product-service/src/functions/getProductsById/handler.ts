import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { convertToProductStockType, convertToProductType } from '@libs/convert';
import type { IProduct, IProductStock } from 'src/types/product';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const productsTable = async (id: string): Promise<IProduct> => {
  const command = new GetCommand({
    TableName: process.env.PRODUCTS_TABLE,
    Key: {
      id,
    },
  });

  const response = await docClient.send(command);
  return response.Item as IProduct;
};

const productsStockTable = async (id: string): Promise<IProductStock> => {
  const command = new GetCommand({
    TableName: process.env.PRODUCTS_STOCK_TABLE,
    Key: {
      product_id: id,
    },
  });

  const response = await docClient.send(command);
  return response.Item as IProductStock;
};

const getProductsById: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  try {
    console.log('event.pathParameters', event.pathParameters);
    const productId = event.pathParameters.productId;
    const [product, productsStock] = await Promise.all([
      productsTable(productId),
      productsStockTable(productId),
    ]);
    console.log('product', product);
    console.log('productsStock', productsStock);
    return formatJSONResponse({
      ...product,
      rating: {
        ...product.rating,
        count: productsStock?.count,
      },
    });
  } catch (error) {
    console.log('error', error);
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ error: 'productId is missing' }),
    };
  }
};

export const main = getProductsById;
