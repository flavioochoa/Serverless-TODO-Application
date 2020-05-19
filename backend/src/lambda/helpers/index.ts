import * as AWS from 'aws-sdk'

export const docClient = new AWS.DynamoDB.DocumentClient();
export const todosTable = process.env.TODOS_TABLE;
export const bucketName = process.env.TODOS_S3_BUCKET;
export const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export const s3 = new AWS.S3({
    signatureVersion: 'v4'
});

export async function getUserById(userId: string) {
    const result = await docClient.query({
        TableName: todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        ScanIndexForward: false
    }).promise()

    return result.Items;
}

export function getToken(headers: { [name: string]: string }): string {
    const authHeader = headers.Authorization;

    if (!authHeader) throw new Error('No authentication header');
  
    if (!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header');
  
    const split = authHeader.split(' ');
    const token = split[1];
  
    return token;
}