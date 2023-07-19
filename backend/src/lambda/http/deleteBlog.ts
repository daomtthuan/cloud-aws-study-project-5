import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { deleteBlog } from '../../businessLogic/blog';
import { getUserId } from '../utils';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const blogId = event.pathParameters.blogId;

  const userId = getUserId(event);
  const result = await deleteBlog(userId, blogId);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      result,
    }),
  };
};
