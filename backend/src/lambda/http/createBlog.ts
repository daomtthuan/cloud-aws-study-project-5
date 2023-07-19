import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createBlog } from '../../businessLogic/blog';
import { CreateBlogRequest } from '../../requests/CreateBlogRequest';
import { getUserId } from '../utils';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newBlog: CreateBlogRequest = JSON.parse(event.body);

  const userId = getUserId(event);
  const newUser = await createBlog(newBlog, userId);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      item: newUser,
    }),
  };
};
