import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { updateBlog } from '../../businessLogic/blog';
import { UpdateBlogRequest } from '../../requests/UpdateBlogRequest';
import { getUserId } from '../utils';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const blogId = event.pathParameters.blogId;
  const updatedBlog: UpdateBlogRequest = JSON.parse(event.body);

  const userId = getUserId(event);
  await updateBlog(blogId, userId, updatedBlog);

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: '',
  };
};
