import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { searchBlogs } from '../../businessLogicLayer/BlogLogic';
import { createLogger } from '../../utils/logger';
import { getUserId } from '../utils';

const logger = createLogger('SearchBlogs');

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  logger.info('SearchBlog.handler');

  const userId = getUserId(event);
  const keyword = event.queryStringParameters.keyword;

  const result = await searchBlogs(userId, keyword);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ items: result }),
  };
}
