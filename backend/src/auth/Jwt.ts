import { JwtHeader } from 'jsonwebtoken';

import { JwtPayload } from './JwtPayload';

/**
 * Interface representing a JWT token
 */
export interface Jwt {
  header: JwtHeader;
  payload: JwtPayload;
}
