import * as uuid from 'uuid';

import { parseUserId } from '../auth/utils';
import { BlogAccess } from '../dataLayer/blogsAcess';
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { Blog } from '../models/Blog';
import { CreateBlogRequest } from '../requests/CreateBlogRequest';
import { UpdateBlogRequest } from '../requests/UpdateBlogRequest';
import { createLogger } from '../utils/logger';

const logger = createLogger('BlogAccess');
const attUtils = new AttachmentUtils();
const blogAccess = new BlogAccess();

// Search
export async function searchBlog(searchText: string, userId: string) {
  return await blogAccess.searchBlog(searchText, userId);
}

// Get
export async function getBlogs(jwtToken: string): Promise<Blog[]> {
  const userId = parseUserId(jwtToken);
  return blogAccess.getBlogs(userId);
}

// Create
export const createBlog = async (createRequest: CreateBlogRequest, userId: string): Promise<Blog> => {
  logger.info('Create blog entry');

  const blogId = uuid.v4();
  const createdAt = new Date().toISOString();
  const s3AttachmentUrl = attUtils.getAttachmentUrl(blogId);
  const blog: Blog = {
    userId,
    blogId,
    createdAt,
    attachmentUrl: s3AttachmentUrl,
    ...createRequest,
  };

  return await blogAccess.createBlog(blog);
};

// Update
export async function updateBlog(blogId: string, userId: string, updateRequest: UpdateBlogRequest) {
  return await blogAccess.updateBlog(blogId, userId, updateRequest);
}

// Delete
export async function deleteBlog(userId: string, blogId: string): Promise<boolean> {
  return await blogAccess.deleteBlog(userId, blogId);
}

// Upload Image
export async function createAttachmentUrl(userId: string, blogId: string) {
  logger.info('Create attachment entry');
  blogAccess.updateBlogAttachmentUrl(userId, blogId);
  return attUtils.getUploadUrl(blogId);
}
