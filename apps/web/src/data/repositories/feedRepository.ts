import type {
  CommentDto,
  CommentsResponseDto,
  CreateCommentRequestDto,
  CreatePostRequestDto,
  FeedResponseDto,
  FollowListResponseDto,
  FollowResponseDto,
  LikeResponseDto,
  PostDto,
  ShareResponseDto,
} from '@bitemate/shared';
import { apiFetch, authHeaders } from '@/data/api/client';

export async function fetchUserPosts(
  accessToken: string,
  userId: string,
): Promise<FeedResponseDto> {
  return apiFetch<FeedResponseDto>(`/users/${userId}/posts`, {
    headers: authHeaders(accessToken),
  });
}

export async function fetchFeed(
  accessToken: string,
  cursor?: string,
): Promise<FeedResponseDto> {
  const search = new URLSearchParams({ limit: '20' });
  if (cursor) {
    search.set('cursor', cursor);
  }

  return apiFetch<FeedResponseDto>(`/feed?${search.toString()}`, {
    headers: authHeaders(accessToken),
  });
}

export async function createPost(
  accessToken: string,
  payload: CreatePostRequestDto,
): Promise<PostDto> {
  return apiFetch<PostDto>('/posts', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function updatePost(
  accessToken: string,
  postId: string,
  payload: { caption?: string },
): Promise<PostDto> {
  return apiFetch<PostDto>(`/posts/${postId}`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function toggleLike(
  accessToken: string,
  postId: string,
): Promise<LikeResponseDto> {
  return apiFetch<LikeResponseDto>(`/posts/${postId}/like`, {
    method: 'POST',
    headers: authHeaders(accessToken),
  });
}

export async function addComment(
  accessToken: string,
  postId: string,
  payload: CreateCommentRequestDto,
): Promise<CommentDto> {
  return apiFetch<CommentDto>(`/posts/${postId}/comment`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchComments(
  accessToken: string,
  postId: string,
): Promise<CommentsResponseDto> {
  return apiFetch<CommentsResponseDto>(`/posts/${postId}/comments?limit=20`, {
    headers: authHeaders(accessToken),
  });
}

export async function sharePost(
  accessToken: string,
  postId: string,
): Promise<ShareResponseDto> {
  return apiFetch<ShareResponseDto>(`/posts/${postId}/share`, {
    method: 'POST',
    headers: authHeaders(accessToken),
  });
}

export async function toggleFollow(
  accessToken: string,
  userId: string,
): Promise<FollowResponseDto> {
  return apiFetch<FollowResponseDto>(`/follow/${userId}`, {
    method: 'POST',
    headers: authHeaders(accessToken),
  });
}

export async function fetchFollowList(
  accessToken: string,
  userId: string,
  mode: 'followers' | 'following',
): Promise<FollowListResponseDto> {
  return apiFetch<FollowListResponseDto>(`/users/${userId}/${mode}`, {
    headers: authHeaders(accessToken),
  });
}
