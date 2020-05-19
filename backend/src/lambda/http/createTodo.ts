import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { customHttpResponse } from '../helpers/customHttpResponse'
import { createTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { getToken } from '../helpers';
const logger = createLogger('createTodo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const token = getToken(event.headers);
  const item = await createTodo(newTodo, token);
  return customHttpResponse({ statusCode: 201, body:{ item } });
}
