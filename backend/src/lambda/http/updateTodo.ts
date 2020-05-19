import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getToken } from '../helpers';
import { customHttpResponse } from '../helpers/customHttpResponse';
import { updateTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
const logger = createLogger('getTodos');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Caller event', event);
  const todoId = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  const token = getToken(event.headers);
  await updateTodo(todoId, updatedTodo, token);
  return customHttpResponse({ statusCode: 200 });
}
