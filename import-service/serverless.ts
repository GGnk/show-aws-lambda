import type { AWS } from '@serverless/typescript';

import { importFileParser, importProductsFile } from '@functions/index';
import { QUEUE_NAME } from 'src/constants';

const serverlessConfiguration: AWS = {
  service: 'import-service',
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
      BUCKET: 'bucket-task-5',
      SQS_URL: `https://sqs.eu-west-1.amazonaws.com/383075539083/${QUEUE_NAME}`,
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:ListBucket'],
        Resource: 'arn:aws:s3:::${self:provider.environment.BUCKET}/*',
      },
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: `arn:aws:sqs:eu-west-1:383075539083:${QUEUE_NAME}`,
      },
    ],
  },
  functions: { importFileParser, importProductsFile },
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
      host: 'vgcgj91pw6.execute-api.eu-west-1.amazonaws.com/dev',
    },
  },
};

module.exports = serverlessConfiguration;
