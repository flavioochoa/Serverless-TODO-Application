import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getToken } from '../helpers';
import { customHttpResponse } from '../helpers/customHttpResponse';
import { createLogger } from '../../utils/logger';
const logger = createLogger('getTodos');
import { getTodosPerUser } from '../../businessLogic/todos';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Caller event', event);
  const token = getToken(event.headers);
  const items = await getTodosPerUser(token);

  return customHttpResponse({ statusCode: 200, body: {items} });
}