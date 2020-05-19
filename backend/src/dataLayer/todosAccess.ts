import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {

    }

    async getTodosPerUser(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        }).promise()

        return result.Items as TodoItem[];
    }

    async createTodo(item: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise();

        return item
    }

    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<void> {
        const { name, dueDate, done } = todoUpdate;
        const params = {
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: 'set #name_value = :nameValue, dueDate=:dueDate, done=:done ',
            ConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':nameValue': name,
                ':dueDate': dueDate,
                ':done': done,
                ':todoId': todoId,
            },
            ExpressionAttributeNames: {
                '#name_value': 'name'
            },
            ReturnValues: 'UPDATED_NEW'
        };

        await this.docClient.update(params).promise();
    }

    async deleteTodo(userId: string, todoId: string, ): Promise<void> {
        const params = {
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            ConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId
            }
        };

        await this.docClient.delete(params).promise();
    }

    async updateTodoAttachment(userId: string, todoId: string, attachmentUrl: string): Promise<void> {
        const params = {
            TableName: this.todosTable,
            Key: {
              userId,
              todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ConditionExpression:'todoId = :todoId',
            ExpressionAttributeValues: {
              ':attachmentUrl': attachmentUrl,
              ':todoId': todoId,
            },
            ReturnValues: 'UPDATED_NEW'
          };
        
        await this.docClient.update(params).promise();
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}