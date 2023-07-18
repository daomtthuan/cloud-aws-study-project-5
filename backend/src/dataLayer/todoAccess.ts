import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodoAccess');

const attachment = new AttachmentUtils();

export class TodosAccess {
  private readonly docClient: DocumentClient;

  public constructor() {
    this.docClient = new XAWS.DynamoDB.DocumentClient();
  }

  async getAllTodos(): Promise<TodoItem[]> {
    logger.info('getAllTodos called');

    const result = await this.docClient
      .query({
        TableName: process.env.TODOS_TABLE,
      })
      .promise();

    const items = result.Items;
    return items as TodoItem[];
  }

  // Get Todos
  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info('getTodos called');

    const result = await this.docClient
      .query({
        TableName: process.env.TODOS_TABLE,
        IndexName: process.env.INDEX_NAME,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise();

    const items = result.Items;
    return items as TodoItem[];
  }

  // Create todo
  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('createTodoItem called');

    const result = await this.docClient
      .put({
        TableName: process.env.TODOS_TABLE,
        Item: todoItem,
      })
      .promise();
    logger.info('Todo item created', result);
    return todoItem as TodoItem;
  }

  // Delete todo
  async deleteTodo(userId: string, todoId: string): Promise<boolean> {
    logger.info('deleteTodo called');

    await this.docClient
      .delete({
        TableName: process.env.TODOS_TABLE,
        Key: {
          userId: userId,
          todoId: todoId,
        },
      })
      .promise();
    return true;
  }

  // Update todo
  async updateTodo(todoId: string, userId: string, updateTodoRequest: UpdateTodoRequest): Promise<void> {
    logger.info('updateTodoAttachmentUrl called');

    const expressionAttibutes = {
      ':done': updateTodoRequest.done,
      ':name': updateTodoRequest.name,
      ':dueDate': updateTodoRequest.dueDate,
    };
    const updateExpression = 'set done = :done, dueDate= :dueDate, #n= :name';

    await this.docClient
      .update({
        TableName: process.env.TODOS_TABLE,
        Key: {
          userId: userId,
          todoId: todoId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttibutes,
        ExpressionAttributeNames: {
          '#n': 'name',
        },
      })
      .promise();
  }

  // Upload Image
  async updateTodoAttachmentUrl(userId: string, todoId: string): Promise<void> {
    logger.info('updateTodoAttachmentUrl called');

    const s3AttachmentUrl = attachment.getAttachmentUrl(todoId);
    const dbTodoTable = process.env.TODOS_TABLE;
    const params = {
      TableName: dbTodoTable,
      Key: {
        userId,
        todoId,
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': s3AttachmentUrl,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    await this.docClient.update(params).promise();
  }
}
