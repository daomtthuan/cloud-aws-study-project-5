import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getBlogs } from '../../businessLogicLayer/BlogLogic';
import { createLogger } from '../../utils/logger';
import { getJwtToken } from '../utils';

const logger = createLogger('GetBlogs');

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  logger.info('GetBlogs.handler');

  const jwtToken = getJwtToken(event);

  const result = await getBlogs(jwtToken);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ items: result }),
  };
}
