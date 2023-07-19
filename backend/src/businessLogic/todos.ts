import * as uuid from 'uuid';

import { parseUserId } from '../auth/utils';
import { TodosAccess } from '../dataLayer/todoAccess';
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';

const logger = createLogger('[Todos]');

const attachmentUtils = new AttachmentUtils();
const todosAccess = new TodosAccess();

// Get User todos
export async function getUserTodos(token: string): Promise<TodoItem[]> {
  logger.info('getUserTodos called');

  const userId = parseUserId(token);

  return todosAccess.getTodos(userId);
}

// Create Todo
export async function createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {
  logger.info('createTodo called');

  const todoId = uuid.v4();
  const createdAt = new Date().toISOString();
  const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId);
  const newItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachmentUrl: s3AttachmentUrl,
    ...newTodo,
  };

  return await todosAccess.createTodoItem(newItem);
}

// Update Todo
export async function updateTodo(userId: string, todoId: string, request: UpdateTodoRequest): Promise<void> {
  logger.info('updateTodo called');

  return await todosAccess.updateTodo(userId, todoId, request);
}

// Delete Todo
export async function deleteTodo(userId: string, todoId: string): Promise<boolean> {
  logger.info('deleteTodo called');

  return await todosAccess.deleteTodo(userId, todoId);
}

// Upload Image
export async function createAttachment(userId: string, todoId: string): Promise<string> {
  logger.info('createAttachmentUrl called');

  todosAccess.updateTodoAttachment(userId, todoId);

  return attachmentUtils.getUploadUrl(todoId);
}
