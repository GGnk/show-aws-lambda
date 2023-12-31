import type { AWS } from '@serverless/typescript';

import { getProductsList, getProductsById, createProduct, catalogBatchProcess } from '@functions';
import { QUEUE_NAME, TOPIC } from 'src/constants';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-auto-swagger'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'eu-west-1',
    profile: 'aws-training',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      PRODUCTS_TABLE: 'aws_products',
      PRODUCTS_STOCK_TABLE: 'aws_products_stock',
      SNS_ARN: {
        Ref: 'SnsTopic',
      },
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'dynamodb:*',
        Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/*',
      },
      {
        Effect: 'Allow',
        Action: ['sns:*'],
        Resource: {
          Ref: 'SnsTopic',
        },
      },
    ],
  },
  functions: { getProductsList, getProductsById, createProduct, catalogBatchProcess },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    autoswagger: {
      host: 'kvk5koj7u5.execute-api.eu-west-1.amazonaws.com/dev',
    },
  },
  resources: {
    Resources: {
      ProductsDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.PRODUCTS_TABLE}',
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 3,
            WriteCapacityUnits: 3,
          },
        },
      },
      ProductsStockDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.PRODUCTS_STOCK_TABLE}',
          AttributeDefinitions: [{ AttributeName: 'product_id', AttributeType: 'S' }],
          KeySchema: [{ AttributeName: 'product_id', KeyType: 'HASH' }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 3,
            WriteCapacityUnits: 3,
          },
        },
      },
      SqsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: QUEUE_NAME,
        },
      },
      SnsTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: TOPIC,
        },
      },
      SnsSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'nurlan.it3@gmail.com', // TODO: for testing
          Protocol: 'email',
          TopicArn: {
            Ref: 'SnsTopic',
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
