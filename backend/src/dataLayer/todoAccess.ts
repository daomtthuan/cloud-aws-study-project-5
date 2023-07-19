import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('[TodoAccess]');

export class TodosAccess {
  private readonly docClient: DocumentClient;

  public constructor() {
    this.docClient = new XAWS.DynamoDB.DocumentClient();
  }

  // Get all todos
  async getAllTodos(): Promise<TodoItem[]> {
    logger.info('getAllTodos called');

    const result = await this.docClient
      .query({
        TableName: process.env.TODOS_TABLE,
      })
      .promise();

    logger.info('getAllTodos done', result);

    return result.Items as TodoItem[];
  }

  // Get todos of user
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

    logger.info('getTodos done', result);

    return result.Items as TodoItem[];
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

    logger.info('createTodoItem done', result);

    return todoItem as TodoItem;
  }

  // Update todo
  async updateTodo(userId: string, todoId: string, request: UpdateTodoRequest): Promise<void> {
    logger.info('updateTodoAttachmentUrl called');

    const expressionAttributes = {
      ':name': request.name,
      ':done': request.done,
      ':dueDate': request.dueDate,
    };
    const updateExpression = 'set done = :done, dueDate= :dueDate, #n= :name';

    const result = await this.docClient
      .update({
        TableName: process.env.TODOS_TABLE,
        Key: {
          userId: userId,
          todoId: todoId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributes,
        ExpressionAttributeNames: {
          '#n': 'name',
        },
      })
      .promise();

    logger.info('updateTodoAttachmentUrl done', result);
  }

  // Delete todo
  async deleteTodo(userId: string, todoId: string): Promise<boolean> {
    logger.info('deleteTodo called');

    const result = await this.docClient
      .delete({
        TableName: process.env.TODOS_TABLE,
        Key: {
          userId: userId,
          todoId: todoId,
        },
      })
      .promise();

    logger.info('deleteTodo done', result);

    return true;
  }

  // Upload Image
  async updateTodoAttachment(userId: string, todoId: string): Promise<void> {
    logger.info('updateTodoAttachmentUrl called');

    const attachment = new AttachmentUtils();
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

    const result = await this.docClient.update(params).promise();

    logger.info('updateTodoAttachmentUrl done', result);
  }
}
