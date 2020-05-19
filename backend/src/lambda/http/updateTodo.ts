import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import { docClient, todosTable, getToken } from '../helpers';
import { parseUserId } from '../../auth/utils';
import { customHttpResponse } from '../helpers/customHttpResponse';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
  const { name, dueDate, done } = updatedTodo;
  const token = getToken(event.headers);
  const userId = parseUserId(token);
  
  const params = {
    TableName: todosTable,
    Key: {
      userId,
      todoId
    },
    UpdateExpression: "set #name_value = :nameValue, dueDate=:dueDate, done=:done ",
    ConditionExpression:"todoId = :todoId",
    ExpressionAttributeValues: {
      ":nameValue": name,
      ":dueDate": dueDate,
      ":done": done,
      ':todoId': todoId,
    },
    ExpressionAttributeNames: {
      "#name_value": "name"
    },
    ReturnValues: "UPDATED_NEW"
  };

  await docClient.update(params).promise();

  return customHttpResponse({ statusCode: 200 });
}
