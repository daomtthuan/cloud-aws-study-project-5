import { APIGatewayProxyEvent } from 'aws-lambda';

import { parseUserId } from '../auth/utils';

/**
 * Get JWT token from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a JWT token
 */
export function getJwtToken(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  return jwtToken;
}

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const jwtToken = getJwtToken(event);

  return parseUserId(jwtToken);
}
