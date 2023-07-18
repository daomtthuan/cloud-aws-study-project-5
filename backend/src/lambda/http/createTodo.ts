import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createTodo } from '../../businessLogic/todos';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createLogger } from '../../utils/logger';
import { getUserId } from '../utils';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  createLogger('Processing event: ' + event);

  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const userId = getUserId(event);
  const newItem = await createTodo(newTodo, userId);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      item: newItem,
    }),
  };
}
