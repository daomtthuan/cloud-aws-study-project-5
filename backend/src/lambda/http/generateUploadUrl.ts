import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createAttachment } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { getUserId } from '../utils';

const logger = createLogger('[GenerateUploadUrl]');

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  logger.info('Handle: ' + event);

  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  const url = await createAttachment(userId, todoId);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };
  const data = {
    uploadUrl: url,
  };

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(data),
  };
}
