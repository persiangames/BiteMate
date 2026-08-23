import { io, type Socket } from 'socket.io-client';

import type {

  ChatMessageDto,

  ChatReadEventDto,

  ChatTypingEventDto,

  MeetupInviteDto,

  NotificationDto,

  UserPresenceDto,

} from '@bitemate/shared';



const SOCKET_URL =

  import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';



let socket: Socket | null = null;



export function connectRealtime(accessToken: string): Socket {

  if (socket?.connected) {

    return socket;

  }



  socket = io(`${SOCKET_URL}/realtime`, {

    auth: { token: accessToken },

    transports: ['websocket'],

  });



  return socket;

}



export function disconnectRealtime(): void {

  socket?.disconnect();

  socket = null;

}



export function getSocket(): Socket | null {

  return socket;

}



export function joinChat(chatId: string): void {

  socket?.emit('join-chat', { chatId });

}



export function leaveChat(chatId: string): void {

  socket?.emit('leave-chat', { chatId });

}



export function emitTyping(chatId: string, isTyping: boolean): void {

  socket?.emit('chat:typing', { chatId, isTyping });

}



export function emitChatRead(chatId: string, upToMessageId?: string): void {

  socket?.emit('chat:read', { chatId, upToMessageId });

}



export function joinMeetupRoom(roomId: string): void {

  socket?.emit('join-room', { roomId });

}



export function onChatMessage(handler: (message: ChatMessageDto) => void): () => void {

  socket?.on('chat:message', handler);

  return () => socket?.off('chat:message', handler);

}



export function onChatTyping(handler: (event: ChatTypingEventDto) => void): () => void {

  socket?.on('chat:typing', handler);

  return () => socket?.off('chat:typing', handler);

}



export function onChatRead(handler: (event: ChatReadEventDto) => void): () => void {

  socket?.on('chat:read', handler);

  return () => socket?.off('chat:read', handler);

}



export function onPresenceUpdate(handler: (presence: UserPresenceDto) => void): () => void {

  socket?.on('presence:update', handler);

  return () => socket?.off('presence:update', handler);

}



export function onMeetupInvite(handler: (invite: MeetupInviteDto) => void): () => void {

  socket?.on('meetup:invite', handler);

  return () => socket?.off('meetup:invite', handler);

}



export function onMeetupInviteAccepted(

  handler: (invite: MeetupInviteDto) => void,

): () => void {

  socket?.on('meetup:invite:accepted', handler);

  return () => socket?.off('meetup:invite:accepted', handler);

}



export function onMeetupInviteRejected(

  handler: (invite: MeetupInviteDto) => void,

): () => void {

  socket?.on('meetup:invite:rejected', handler);

  return () => socket?.off('meetup:invite:rejected', handler);

}



export function onNotification(handler: (notification: NotificationDto) => void): () => void {

  socket?.on('notification:new', handler);

  return () => socket?.off('notification:new', handler);

}

