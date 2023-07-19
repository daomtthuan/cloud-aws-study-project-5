import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { deleteBlog } from '../../businessLogicLayer/BlogLogic';
import { createLogger } from '../../utils/logger';
import { getUserId } from '../utils';

const logger = createLogger('DeleteBlog');

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  logger.info('DeleteBlog.handler');

  const userId = getUserId(event);
  const blogId = event.pathParameters.blogId;

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
}
