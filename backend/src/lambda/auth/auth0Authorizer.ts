import 'source-map-support/register';

import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import Axios from 'axios';
import { decode, verify } from 'jsonwebtoken';

import { Jwt } from '../../auth/Jwt';
import { JwtPayload } from '../../auth/JwtPayload';
import { createLogger } from '../../utils/logger';

const logger = createLogger('auth');

// JSON Web key set
const jwksUrl = 'https://dev-e07f8djplbwxi7u6.us.auth0.com/.well-known/jwks.json';

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info('User was authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*',
          },
        ],
      },
    };
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*',
          },
        ],
      },
    };
  }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;

  const res = await Axios.get(jwksUrl);
  const keys = res.data.keys;
  const signInKeys = keys.find((key: { kid: string }) => key.kid === jwt.header.kid);

  logger.info('--SIGNIN KEYS--', signInKeys);

  if (!signInKeys) {
    throw new Error('SignIn Keys not found!');
  }

  // Get pem data
  const pemData = signInKeys.x5c[0];

  // Convert pem data to cert
  const cert = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`;

  // Verify token
  const verifiedToken = verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
  logger.info('-----VERIFY TOKEN------', verifiedToken);

  return verifiedToken;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer ')) throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];
  return token;
}
