import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as uuid from 'uuid';
import { docClient, todosTable, getToken } from '../helpers';
import { parseUserId } from '../../auth/utils';
import { customHttpResponse } from '../helpers/customHttpResponse'

import { createLogger } from '../../utils/logger';
const logger = createLogger('createTodo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  logger.info('Processing event: ', event)
  const token = getToken(event.headers);
  const userId = parseUserId(token);
  const todoId = uuid.v4();
  const createdAt = new Date().toISOString();
  
  const item = {
    userId,
    todoId, 
    ...newTodo,
    createdAt,
    done: false,
    attachmentUrl: ''
  };

  await docClient.put({
    TableName: todosTable,
    Item: item
  }).promise();

  return customHttpResponse({ statusCode: 201, body:{ item } });
}
