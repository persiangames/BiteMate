import type {
  ChatMessageDto,
  ChatSummaryDto,
  ChatsListResponseDto,
  CreateDirectChatRequestDto,
  CreateMessageRequestDto,
  MessagesListResponseDto,
} from '@bitemate/shared';
import { apiFetch, authHeaders } from '@/data/api/client';

export async function fetchChats(accessToken: string): Promise<ChatsListResponseDto> {
  return apiFetch<ChatsListResponseDto>('/chats', {
    headers: authHeaders(accessToken),
  });
}

export async function createDirectChat(
  accessToken: string,
  payload: CreateDirectChatRequestDto,
): Promise<ChatSummaryDto> {
  return apiFetch<ChatSummaryDto>('/chats/direct', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchMessages(
  accessToken: string,
  chatId: string,
  cursor?: string,
): Promise<MessagesListResponseDto> {
  const search = new URLSearchParams({ limit: '50' });
  if (cursor) search.set('cursor', cursor);

  return apiFetch<MessagesListResponseDto>(
    `/messages/${chatId}?${search.toString()}`,
    { headers: authHeaders(accessToken) },
  );
}

export async function sendMessage(
  accessToken: string,
  payload: CreateMessageRequestDto,
): Promise<ChatMessageDto> {
  return apiFetch<ChatMessageDto>('/messages', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function markChatRead(
  accessToken: string,
  chatId: string,
): Promise<void> {
  await apiFetch(`/messages/${chatId}/read`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({}),
  });
}
