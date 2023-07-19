import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createBlog } from '../../businessLogicLayer/BlogLogic';
import { CreateBlogRequest } from '../../requests/CreateBlogRequest';
import { createLogger } from '../../utils/logger';
import { getUserId } from '../utils';

const logger = createLogger('CreateBlog');

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  logger.info('CreateBlog.handler');

  const userId = getUserId(event);
  const createBlogRequest: CreateBlogRequest = JSON.parse(event.body);

  const result = await createBlog(userId, createBlogRequest);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      item: result,
    }),
  };
}
