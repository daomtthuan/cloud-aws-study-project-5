import Axios from 'axios';

import { apiEndpoint } from '../config';
import { Blog } from '../types/Blog';
import { CreateBlogRequest } from '../types/CreateBlogRequest';
import { UpdateBlogRequest } from '../types/UpdateBlogRequest';

// Search Blog
export async function searchBlogs(searchText: string, idToken: string): Promise<Blog[]> {
  const response = await Axios.get(`${apiEndpoint}/search?keyword=${searchText}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
  });
  return response.data.items;
}

export async function getBlogs(idToken: string): Promise<Blog[]> {
  console.log('Fetching blogs');

  const response = await Axios.get(`${apiEndpoint}/blogs`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
  });
  console.log('Blogs:', response.data);
  return response.data.items;
}

export async function createBlog(idToken: string, newBlog: CreateBlogRequest): Promise<Blog> {
  const response = await Axios.post(`${apiEndpoint}/blogs`, JSON.stringify(newBlog), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
  });
  return response.data.item;
}

export async function patchBlog(idToken: string, blogId: string, updatedRequest: UpdateBlogRequest): Promise<void> {
  await Axios.patch(`${apiEndpoint}/blogs/${blogId}`, JSON.stringify(updatedRequest), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
  });
}

export async function deleteBlog(idToken: string, blogId: string): Promise<void> {
  await Axios.delete(`${apiEndpoint}/blogs/${blogId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
  });
}

export async function getUploadUrl(idToken: string, blogId: string): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/blogs/${blogId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
  });
  return response.data.uploadUrl;
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file);
}
