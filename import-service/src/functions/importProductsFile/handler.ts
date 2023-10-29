import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  try {
    const s3 = new S3({ region: 'eu-west-1' });
    const BUCKET_NAME = process.env.BUCKET;
    const { name } = event.queryStringParameters;

    const params = {
      Bucket: BUCKET_NAME,
      Key: `uploaded/${name}`,
    };
    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return formatJSONResponse({ signedUrl });
  } catch (error) {
    console.log('importProductsFile error', error);
    return formatJSONResponse(`[importProductsFile] Error: ${error.message}`, 500);
  }
};
export const main = importProductsFile;
