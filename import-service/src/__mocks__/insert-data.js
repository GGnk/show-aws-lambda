import { v4 as uuidv4 } from 'uuid';
import mockedProducts from './products.js';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-providers';

const client = new DynamoDBClient({
  apiVersion: 'latest',
  region: 'eu-west-1',
  credentials: fromIni({
    profile: 'aws-training',
  }),
});
const docClient = DynamoDBDocumentClient.from(client);

const productsWithUniqueID = mockedProducts.map((product) => ({
  ...product,
  id: uuidv4(),
}));

const stocks = productsWithUniqueID.map((product) => ({
  product_id: product.id,
  count: product.rating.count,
}));

const insertData = async (params, tableName) => {
  const command = new PutCommand({
    TableName: tableName,
    Item: params,
  });
  try {
    await docClient.send(command);
    console.log('Success', params);
  } catch (error) {
    console.log('Error', error);
  }
};

// Insert products data
await Promise.all(
  productsWithUniqueID.map(async (product) => {
    await insertData(product, 'aws_products');
  }),
);

// Insert stocks data
await Promise.all(
  stocks.map(async (stock) => {
    await insertData(stock, 'aws_products_stock');
  }),
);
