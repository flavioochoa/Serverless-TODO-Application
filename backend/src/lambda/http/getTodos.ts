import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { docClient, todosTable, getToken } from '../helpers';
import { parseUserId } from '../../auth/utils';
import { customHttpResponse } from '../helpers/customHttpResponse';
import { createLogger } from '../../utils/logger';
const logger = createLogger('getTodos');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Caller event', event);
  const token = getToken(event.headers);
  const userId = parseUserId(token);
  const items = await getTodosPerUser(userId);

  return customHttpResponse({ statusCode: 200, body: {items} });
}

async function getTodosPerUser(userId: string) {
  const result = await docClient.query({
    TableName: todosTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false
  }).promise()

  return result.Items
}
