import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createTodo } from '../../businessLogic/todos';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createLogger } from '../../utils/logger';
import { getUserId } from '../utils';

const logger = createLogger('[CreateTodo]');

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  logger.info('Handle: ' + event);

  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const userId = getUserId(event);
  const newItem = await createTodo(userId, newTodo);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };
  const data = {
    item: newItem,
  };

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(data),
  };
}
