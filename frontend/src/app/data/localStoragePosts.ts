// Temporary localStorage approval flow for demo
// This file manages post storage in localStorage for the demo approval flow

import { Post } from '../data/types';

const STORAGE_KEY = 'allumini_posts_demo';

export interface LocalPost extends Post {
  authorName?: string;
  authorAvatar?: string;
}

export const getLocalPosts = (): LocalPost[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveLocalPosts = (posts: LocalPost[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('[localStoragePosts] Error saving posts:', e);
  }
};

export const addLocalPost = (post: LocalPost): LocalPost[] => {
  const posts = getLocalPosts();
  posts.unshift(post);
  saveLocalPosts(posts);
  return posts;
};

export const updateLocalPost = (postId: string, updates: Partial<LocalPost>): LocalPost[] => {
  const posts = getLocalPosts();
  const updated = posts.map(p => p.id === postId ? { ...p, ...updates } : p);
  saveLocalPosts(updated);
  return updated;
};

export const deleteLocalPost = (postId: string): LocalPost[] => {
  const posts = getLocalPosts();
  const filtered = posts.filter(p => p.id !== postId);
  saveLocalPosts(filtered);
  return filtered;
};

export const getPendingPosts = (): LocalPost[] => {
  return getLocalPosts().filter(p => p.status === 'pending');
};

export const getApprovedPosts = (): LocalPost[] => {
  return getLocalPosts().filter(p => p.status === 'approved');
};

export const getRejectedPosts = (): LocalPost[] => {
  return getLocalPosts().filter(p => p.status === 'rejected');
};

export const getApprovedHigherEducationPosts = (): LocalPost[] => {
  return getLocalPosts().filter(
    p => p.status === 'approved' && p.type === 'higher-education' && p.authorRole === 'faculty'
  );
};

export const getPostsByAuthor = (authorId: string): LocalPost[] => {
  return getLocalPosts().filter(p => p.alumniId === authorId);
};

export const clearAllLocalPosts = () => {
  localStorage.removeItem(STORAGE_KEY);
};