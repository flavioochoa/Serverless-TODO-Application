import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger';
const logger = createLogger('generateUploadUrl');
import { customHttpResponse } from '../helpers/customHttpResponse';
import { updateTodoAttachment } from '../../businessLogic/todos';
import { getToken } from '../helpers';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const todoId = event.pathParameters.todoId;
  const token = getToken(event.headers);
  const uploadUrl = await updateTodoAttachment(todoId, token);
  return customHttpResponse({ statusCode: 200, body: {uploadUrl} });
}