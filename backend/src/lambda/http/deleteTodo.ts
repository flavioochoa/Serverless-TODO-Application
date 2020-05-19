import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { docClient, todosTable, getToken } from '../helpers';

import { createLogger } from '../../utils/logger';
import { parseUserId } from '../../auth/utils';
import { customHttpResponse } from '../helpers/customHttpResponse';
const logger = createLogger('delete');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  logger.info('trying to delete', todoId);
  const token = getToken(event.headers);
  const userId = parseUserId(token);
  const params = {
    TableName: todosTable,
    Key: {
      userId,
      todoId
    },
    ConditionExpression:"todoId = :todoId",
    ExpressionAttributeValues: {
      ":todoId": todoId
    }
  };


  await docClient.delete(params).promise();
  
  return customHttpResponse({ statusCode: 200 });
}
