import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { AttachmentUtils } from '../helpers/attachmentUtils';
import { Blog } from '../models/Blog';
import { UpdateBlogRequest } from '../requests/UpdateBlogRequest';
import { createLogger } from '../utils/logger';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('BlogAccess');
const attachment = new AttachmentUtils();

export class BlogAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly blogsTable = process.env.BLOGS_TABLE,
    private readonly indexName = process.env.INDEX_NAME,
  ) {}

  // Search Blog
  async searchBlog(searchText: string, userId: string): Promise<Blog[]> {
    const params = {
      TableName: this.blogsTable,
      FilterExpression: 'contains(name, :name)',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':name': searchText,
        ':userId': userId,
      },
    };
    const data = await this.docClient.query(params).promise();
    return data.Items as Blog[];
  }

  async getAllBlogs(): Promise<Blog[]> {
    const result = await this.docClient
      .query({
        TableName: this.blogsTable,
      })
      .promise();

    const items = result.Items;
    return items as Blog[];
  }

  // Get Blog
  async getBlogs(userId: string): Promise<Blog[]> {
    logger.info('Getting all Blogs entry');

    const result = await this.docClient
      .query({
        TableName: this.blogsTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise();

    const items = result.Items;
    return items as Blog[];
  }

  // Create Blog Item
  async createBlog(blog: Blog): Promise<Blog> {
    logger.info('Creating blog entry');
    const result = await this.docClient
      .put({
        TableName: this.blogsTable,
        Item: blog,
      })
      .promise();
    logger.info('Blog created', result);
    return blog as Blog;
  }

  // Update Blog
  async updateBlog(blogId: string, userId: string, request: UpdateBlogRequest) {
    let expressionAttibutes = {
      ':name': request.name,
    };
    let updateExpression = 'set name = :name';

    await this.docClient
      .update({
        TableName: this.blogsTable,
        Key: {
          userId: userId,
          blogId: blogId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttibutes,
      })
      .promise();
  }

  // Delete Blog
  async deleteBlog(userId: string, blogId: string): Promise<boolean> {
    await this.docClient
      .delete({
        TableName: this.blogsTable,
        Key: {
          userId: userId,
          blogId: blogId,
        },
      })
      .promise();
    return true;
  }

  // Upload Image
  async updateBlogAttachmentUrl(userId: string, blogId: string) {
    logger.info('Updating blog attachment url entry');
    const s3AttachmentUrl = attachment.getAttachmentUrl(blogId);
    const dbBlogTable = process.env.BLOGS_TABLE;
    const params = {
      TableName: dbBlogTable,
      Key: {
        userId,
        blogId: blogId,
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
