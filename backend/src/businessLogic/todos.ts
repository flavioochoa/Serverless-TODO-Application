import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem';
import { TodosAccess } from '../dataLayer/todosAccess';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { parseUserId } from '../auth/utils';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { S3Access } from '../dataLayer/s3Access';

const groupAccess = new TodosAccess();
const s3Access = new S3Access();

export async function getTodosPerUser(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken);
  return groupAccess.getTodosPerUser(userId);
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const todoId = uuid.v4();
  const userId = parseUserId(jwtToken);
  const createdAt = new Date().toISOString();

  const item = {
    userId,
    todoId, 
    ...createTodoRequest,
    createdAt,
    done: false,
    attachmentUrl: ''
  };

  return await groupAccess.createTodo(item);
}

export async function updateTodo(
    todoId: string,
    createTodoRequest: UpdateTodoRequest,
    jwtToken: string
  ): Promise<void> {
    const userId = parseUserId(jwtToken);
    await groupAccess.updateTodo(userId, todoId, createTodoRequest);
}

export async function deleteTodo(
    todoId: string,
    jwtToken: string
  ): Promise<void> {
    const userId = parseUserId(jwtToken);
    await groupAccess.deleteTodo(userId, todoId);
}

export async function updateTodoAttachment(
    todoId: string,
    jwtToken: string
  ): Promise<string> {
    const userId = parseUserId(jwtToken);
    const imageId = uuid.v4()
    const uploadUrl = s3Access.getUploadUrl(imageId);
    const attachmentUrl = `https://${s3Access.bucketName}.s3.amazonaws.com/${imageId}`;
    
    await groupAccess.updateTodoAttachment(userId, todoId, attachmentUrl);
    
    return uploadUrl;
}