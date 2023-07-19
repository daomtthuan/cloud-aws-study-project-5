import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { AttachmentUtils } from '../helpers/attachmentUtils';
import { Blog } from '../models/Blog';
import { BlogUpdate } from '../models/BlogUpdate';
import { createLogger } from '../utils/logger';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('BlogProvider');
const attachmentUtils = new AttachmentUtils();

export class BlogProvider {
  private readonly tableName: string;
  private readonly indexName: string;
  private readonly client: DocumentClient;

  public constructor() {
    this.tableName = process.env.BLOGS_TABLE;
    this.indexName = process.env.INDEX_NAME;
    this.client = new XAWS.DynamoDB.DocumentClient();
  }

  // Get all
  public async getAllBlogs(): Promise<Blog[]> {
    logger.info('BlogProvider.getAllBlogs');

    const result = await this.client
      .query({
        TableName: this.tableName,
      })
      .promise();

    logger.info('BlogProvider.getAllBlogs done', result);

    return result.Items as Blog[];
  }

  // Get
  public async getBlogs(userId: string): Promise<Blog[]> {
    logger.info('BlogProvider.getBlogs');

    const result = await this.client
      .query({
        TableName: this.tableName,
        IndexName: this.indexName,
        KeyConditionExpression: '#userIdKey = :userIdValue',
        ExpressionAttributeNames: {
          '#userIdKey': 'userId',
        },
        ExpressionAttributeValues: {
          ':userIdValue': userId,
        },
      })
      .promise();

    logger.info('BlogProvider.getBlogs done', result);

    return result.Items as Blog[];
  }

  // Create
  public async createBlog(blog: Blog): Promise<Blog> {
    logger.info('BlogProvider.createBlog');

    const result = await this.client
      .put({
        TableName: this.tableName,
        Item: blog,
      })
      .promise();

    logger.info('BlogProvider.createBlog done', result);

    return blog as Blog;
  }

  // Update
  public async updateBlog(userId: string, blogId: string, blog: BlogUpdate): Promise<void> {
    logger.info('BlogProvider.updateBlog');

    const result = await this.client
      .update({
        TableName: this.tableName,
        Key: { userId, blogId },
        UpdateExpression: 'set #nameKey = :nameValue, #contentKey = :contentValue',
        ExpressionAttributeNames: {
          '#nameKey': 'name',
          '#contentKey': 'content',
        },
        ExpressionAttributeValues: {
          ':nameValue': blog.name,
          '#contentValue': blog.content,
        },
      })
      .promise();

    logger.info('BlogProvider.updateBlog done', result);
  }

  // Delete
  public async deleteBlog(userId: string, blogId: string): Promise<boolean> {
    logger.info('BlogProvider.deleteBlog');

    const result = await this.client
      .delete({
        TableName: this.tableName,
        Key: { userId, blogId },
      })
      .promise();

    logger.info('BlogProvider.deleteBlog done', result);

    return true;
  }

  // Upload Image
  public async updateBlogAttachmentUrl(userId: string, blogId: string): Promise<void> {
    logger.info('BlogProvider.updateBlogAttachmentUrl');

    const result = await this.client
      .update({
        TableName: this.tableName,
        Key: { userId, blogId },
        UpdateExpression: 'set #attachmentUrlKey = :attachmentUrlValue',
        ExpressionAttributeNames: {
          '#attachmentUrlKey': 'attachmentUrl',
        },
        ExpressionAttributeValues: {
          ':attachmentUrlValue': attachmentUtils.getAttachmentUrl(blogId),
        },
        ReturnValues: 'UPDATED_NEW',
      })
      .promise();

    logger.info('BlogProvider.updateBlogAttachmentUrl done', result);
  }

  // Search
  public async searchBlogs(userId: string, keyword: string): Promise<Blog[]> {
    logger.info('BlogProvider.searchBlog');

    const result = await this.client
      .query({
        TableName: this.tableName,
        KeyConditionExpression: '#userIdKey = :userIdValue',
        FilterExpression: 'contains(#nameKey, :keywordValue)',
        ExpressionAttributeNames: {
          '#userIdKey': 'userId',
          '#nameKey': 'name',
        },
        ExpressionAttributeValues: {
          ':userIdValue': userId,
          ':keywordValue': keyword,
        },
      })
      .promise();

    logger.info('BlogProvider.searchBlog done', result);

    return result.Items as Blog[];
  }
}
