import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { docClient, todosTable, s3, bucketName, urlExpiration, getToken } from '../helpers';
import { parseUserId } from '../../auth/utils';

import { createLogger } from '../../utils/logger';
const logger = createLogger('generateUploadUrl');
import * as uuid from 'uuid';
import { customHttpResponse } from '../helpers/customHttpResponse';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const imageId = uuid.v4()
  const uploadUrl = getUploadUrl(imageId);
  const token = getToken(event.headers);
  const userId = parseUserId(token);

  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`;

  const params = {
    TableName: todosTable,
    Key: {
      userId,
      todoId
    },
    UpdateExpression: "set attachmentUrl = :attachmentUrl",
    ConditionExpression:"todoId = :todoId",
    ExpressionAttributeValues: {
      ':attachmentUrl': attachmentUrl,
      ':todoId': todoId,
    },
    ReturnValues: "UPDATED_NEW"
  };

  logger.info('params', params);

  var result = await docClient.update(params).promise();

  logger.info('result', result);

  return customHttpResponse({ statusCode: 200, body: {uploadUrl} });
}

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}
