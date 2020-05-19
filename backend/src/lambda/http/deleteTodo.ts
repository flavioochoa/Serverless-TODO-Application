import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { customHttpResponse } from '../helpers/customHttpResponse';
import { getToken } from '../helpers';
const logger = createLogger('delete');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const todoId = event.pathParameters.todoId;
  const token = getToken(event.headers);
  await deleteTodo(todoId, token);
  return customHttpResponse({ statusCode: 200 });
}
