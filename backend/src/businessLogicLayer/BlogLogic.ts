import * as uuid from 'uuid';

import { parseUserId } from '../auth/utils';
import { BlogProvider } from '../dataLayer/BlogProvider';
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { Blog } from '../models/Blog';
import { CreateBlogRequest } from '../requests/CreateBlogRequest';
import { UpdateBlogRequest } from '../requests/UpdateBlogRequest';
import { createLogger } from '../utils/logger';

const logger = createLogger('BlogLogic');
const attachmentUtils = new AttachmentUtils();
const provider = new BlogProvider();

// Get
export async function getBlogs(jwtToken: string): Promise<Blog[]> {
  logger.info('BlogLogic.getBlogs');

  const userId = parseUserId(jwtToken);

  return provider.getBlogs(userId);
}

// Create
export const createBlog = async (userId: string, request: CreateBlogRequest): Promise<Blog> => {
  logger.info('BlogLogic.createBlog');

  const blogId = uuid.v4();

  return await provider.createBlog({
    userId,
    blogId,
    createdAt: new Date().toISOString(),
    attachmentUrl: attachmentUtils.getAttachmentUrl(blogId),
    ...request,
  });
};

// Update
export async function updateBlog(blogId: string, userId: string, request: UpdateBlogRequest) {
  logger.info('BlogLogic.updateBlog');

  return await provider.updateBlog(userId, blogId, {
    ...request,
  });
}

// Delete
export async function deleteBlog(userId: string, blogId: string): Promise<boolean> {
  logger.info('BlogLogic.deleteBlog');

  return await provider.deleteBlog(userId, blogId);
}

// Upload Image
export async function createAttachmentUrl(userId: string, blogId: string) {
  logger.info('BlogLogic.createAttachmentUrl');

  provider.updateBlogAttachmentUrl(userId, blogId);

  return attachmentUtils.getUploadUrl(blogId);
}

// Search
export async function searchBlogs(userId: string, keyword: string) {
  logger.info('BlogLogic.searchBlog');

  return await provider.searchBlogs(userId, keyword);
}
