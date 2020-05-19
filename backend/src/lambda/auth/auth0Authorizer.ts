import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const jwksUrl = 'https://flavioochoa.auth0.com/.well-known/jwks.json';

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  const response = await Axios.get(jwksUrl, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const signingKey = getSigningKey(response.data.keys, jwt.header.kid);
  if(!signingKey) {
    throw new Error(`Invalid authentication header ${token}`)
  }

  return verify(token, signingKey.publicKey) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

function getSigningKey(keys, kid) { //from https://auth0.com/blog/navigating-rs256-and-jwks/#Verifying-a-JWT-using-the-JWKS-endpoint
  const signingKeys = keys
    .filter(key => {
      logger.info('key', key);
      return key => key.use === 'sig' // JWK property `use` determines the JWK is for signing
      && key.kty === 'RSA' // We are only supporting RSA (RS256)
      && key.kid           // The `kid` must be present to be useful for later
      && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
  }).map(key => {
      return { kid: key.kid, nbf: key.nbf, publicKey: key.x5c[0] };
    });
  const signingKey = signingKeys.find(key => key.kid === kid);
  return signingKey;
}
