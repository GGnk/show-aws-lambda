import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'import',
        request: {
          parameters: {
            querystrings: {
              name: true,
            },
          },
        },
        cors: true,
        authorizer: {
          arn: 'arn:aws:lambda:eu-west-1:383075539083:function:authorization-service-dev-basicAuthorizer',
          name: 'basicAuthorizer',
          resultTtlInSeconds: 0,
          identitySource: 'method.request.header.Authorization',
          type: 'token',
        },
      },
    },
  ],
};
