import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getUserTodos } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  createLogger('Processing event: ' + event);

  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];
  const result = await getUserTodos(jwtToken);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ items: result }),
  };
}
