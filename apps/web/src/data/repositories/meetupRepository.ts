import type {
  MeetupDto,
  MeetupInviteDto,
  MeetupInviteLimitDto,
  MeetupInvitesResponseDto,
  MeetupMatchesResponseDto,
  MeetupRoomDto,
  MeetupRoomMessageDto,
  MeetupRoomMessagesResponseDto,
  CreateMeetupRequestDto,
  RespondMeetupInviteRequestDto,
  RequestMeetupJoinRequestDto,
  SendMeetupInviteRequestDto,
  SendRoomMessageRequestDto,
} from '@bitemate/shared';
import { apiFetch, authHeaders } from '@/data/api/client';

export async function createMeetup(
  accessToken: string,
  payload: CreateMeetupRequestDto,
): Promise<MeetupDto> {
  return apiFetch<MeetupDto>('/meetups', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchMyMeetups(accessToken: string): Promise<MeetupDto[]> {
  return apiFetch<MeetupDto[]>('/meetups/me', {
    headers: authHeaders(accessToken),
  });
}

export async function fetchMeetupMatches(
  accessToken: string,
  meetupId: string,
): Promise<MeetupMatchesResponseDto> {
  return apiFetch<MeetupMatchesResponseDto>(
    `/meetups/match?meetupId=${encodeURIComponent(meetupId)}`,
    { headers: authHeaders(accessToken) },
  );
}

export async function fetchMyInvites(
  accessToken: string,
): Promise<MeetupInvitesResponseDto> {
  return apiFetch<MeetupInvitesResponseDto>('/meetups/invites/me', {
    headers: authHeaders(accessToken),
  });
}

export async function fetchInviteLimit(
  accessToken: string,
): Promise<MeetupInviteLimitDto> {
  return apiFetch<MeetupInviteLimitDto>('/meetups/invites/limit', {
    headers: authHeaders(accessToken),
  });
}

export async function sendMeetupInvite(
  accessToken: string,
  payload: SendMeetupInviteRequestDto,
): Promise<MeetupInviteDto> {
  return apiFetch<MeetupInviteDto>('/meetups/invite', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function requestMeetupJoin(
  accessToken: string,
  payload: RequestMeetupJoinRequestDto,
): Promise<MeetupInviteDto> {
  return apiFetch<MeetupInviteDto>('/meetups/request-join', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function acceptMeetupInvite(
  accessToken: string,
  payload: RespondMeetupInviteRequestDto,
): Promise<MeetupInviteDto> {
  return apiFetch<MeetupInviteDto>('/meetups/accept', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function rejectMeetupInvite(
  accessToken: string,
  payload: RespondMeetupInviteRequestDto,
): Promise<MeetupInviteDto> {
  return apiFetch<MeetupInviteDto>('/meetups/reject', {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function fetchMeetupRoom(
  accessToken: string,
  roomId: string,
): Promise<MeetupRoomDto> {
  return apiFetch<MeetupRoomDto>(`/meetups/rooms/${roomId}`, {
    headers: authHeaders(accessToken),
  });
}

export async function fetchRoomMessages(
  accessToken: string,
  roomId: string,
): Promise<MeetupRoomMessagesResponseDto> {
  return apiFetch<MeetupRoomMessagesResponseDto>(
    `/meetups/rooms/${roomId}/messages`,
    { headers: authHeaders(accessToken) },
  );
}

export async function sendRoomMessage(
  accessToken: string,
  roomId: string,
  payload: SendRoomMessageRequestDto,
): Promise<MeetupRoomMessageDto> {
  return apiFetch<MeetupRoomMessageDto>(`/meetups/rooms/${roomId}/messages`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}
