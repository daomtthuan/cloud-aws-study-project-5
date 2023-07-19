import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { updateBlog } from '../../businessLogicLayer/BlogLogic';
import { UpdateBlogRequest } from '../../requests/UpdateBlogRequest';
import { createLogger } from '../../utils/logger';
import { getUserId } from '../utils';

const logger = createLogger('UpdateBlog');

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  logger.info('UpdateBlog.handler');

  const userId = getUserId(event);
  const blogId = event.pathParameters.blogId;
  const updateBlogRequest: UpdateBlogRequest = JSON.parse(event.body);

  await updateBlog(blogId, userId, updateBlogRequest);

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: 'Successfully',
  };
}
