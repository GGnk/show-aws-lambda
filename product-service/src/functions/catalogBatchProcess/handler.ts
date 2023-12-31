import { SNS } from '@aws-sdk/client-sns';
import { main as createProduct } from '@functions/createProduct/handler';

export const catalogBatchProcess = async (event) => {
  console.log('catalogBatchProcess called!');
  const products = JSON.parse(event.Records[0].body);

  if (!products || !products?.length) {
    throw new Error('No records found!');
  }
  console.log('[catalogBatchProcess] products ', products);

  try {
    for (const product of products) {
      const prepared = {
        description: product.Description,
        price: product.Price,
        title: product.Title,
        category: product.Category,
        image: product.Image,
        rating: {
          rate: product.Rate,
          count: product.Count,
        },
      };
      console.log('product ', prepared);
      const data = JSON.stringify(prepared);
      // @ts-ignore
      await createProduct({ body: data }, null, (err) => {
        if (err) console.log('catalogBatchProcess -> createProduct -> err', err);
      });
      const sns = new SNS();

      const message = {
        Subject: 'Product was added',
        Message: data,
        TopicArn: process.env.SNS_ARN,
      };
      await sns.publish(message);
    }
  } catch (error) {
    console.log('[catalogBatchProcess] Something went wrong!', error);
  }
};

export const main = catalogBatchProcess;
