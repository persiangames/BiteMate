import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { ChatMessageDto, ChatSummaryDto, ChatTypingEventDto } from '@bitemate/shared';
import { MessageComposer } from '@/presentation/components/MessageComposer';
import {
  connectRealtime,
  emitTyping,
  joinChat,
  leaveChat,
  onChatMessage,
  onChatRead,
  onChatTyping,
} from '@/data/api/socketClient';
import { uploadMedia } from '@/data/api/uploadClient';
import {
  fetchChats,
  fetchMessages,
  markChatRead,
  sendMessage,
} from '@/data/repositories/chatRepository';
import { Avatar } from '@/presentation/components/Avatar';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import {
  dayKey,
  formatDayLabel,
  formatInboxTime,
  formatMessageTime,
} from '@/presentation/utils/chatTime';
import { resolveMediaUrl } from '@/utils/mediaUrl';

export function ChatThreadPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [chat, setChat] = useState<ChatSummaryDto | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [content, setContent] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!accessToken || !chatId) return;

    connectRealtime(accessToken);
    joinChat(chatId);

    async function load() {
      setLoading(true);
      try {
        const [messagePage, chats] = await Promise.all([
          fetchMessages(accessToken!, chatId!),
          fetchChats(accessToken!),
        ]);
        setMessages(messagePage.items);
        setChat(chats.items.find((item) => item.id === chatId) ?? null);
        await markChatRead(accessToken!, chatId!);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('chat.loadFailed'));
      } finally {
        setLoading(false);
      }
    }

    void load();

    const unsubMessage = onChatMessage((message) => {
      if (message.chatId !== chatId) return;
      setMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message],
      );
      if (message.senderId !== user?.id) {
        void markChatRead(accessToken!, chatId!);
      }
    });

    const unsubTyping = onChatTyping((event: ChatTypingEventDto) => {
      if (event.chatId !== chatId || event.userId === user?.id) return;
      setTypingUser(event.isTyping ? event.userId : null);
    });

    const unsubRead = onChatRead((event) => {
      if (event.chatId !== chatId) return;
      setMessages((current) =>
        current.map((message) =>
          event.messageIds.includes(message.id)
            ? {
                ...message,
                readBy: [...message.readBy, { userId: event.userId, readAt: event.readAt }],
              }
            : message,
        ),
      );
    });

    return () => {
      unsubMessage();
      unsubTyping();
      unsubRead();
      leaveChat(chatId);
    };
  }, [accessToken, chatId, t, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const other =
    chat?.participants.find((participant) => participant.id !== user?.id) ?? chat?.participants[0];
  const title = chat?.title ?? other?.fullName ?? other?.username ?? t('nav.chat');
  const typingName =
    chat?.participants.find((participant) => participant.id === typingUser)?.fullName ??
    chat?.participants.find((participant) => participant.id === typingUser)?.username;

  function statusLabel(): { text: string; online: boolean } {
    if (typingName) {
      return { text: `${typingName} ${t('chat.typing')}`, online: true };
    }
    if (typingUser) {
      return { text: t('chat.typing'), online: true };
    }
    if (other?.isOnline) {
      return { text: t('chat.online'), online: true };
    }
    if (chat?.type === 'MEETUP_GROUP') {
      return { text: t('chat.meetup'), online: false };
    }
    if (other?.lastSeen) {
      return {
        text: t('chat.lastSeen', {
          time: formatInboxTime(other.lastSeen, locale, { yesterday: t('chat.yesterday') }),
        }),
        online: false,
      };
    }
    return { text: t('chat.offline'), online: false };
  }

  const status = statusLabel();

  const grouped = useMemo(() => {
    const days: Array<{ key: string; items: ChatMessageDto[] }> = [];
    for (const message of messages) {
      const key = dayKey(message.createdAt);
      const last = days[days.length - 1];
      if (last && last.key === key) {
        last.items.push(message);
      } else {
        days.push({ key, items: [message] });
      }
    }
    return days;
  }, [messages]);

  function handleTyping(value: string) {
    setContent(value);
    if (!chatId) return;

    emitTyping(chatId, true);
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      emitTyping(chatId, false);
    }, 1200);
  }

  async function handleSend() {
    if (!accessToken || !chatId || !content.trim()) return;

    emitTyping(chatId, false);

    try {
      const message = await sendMessage(accessToken, {
        chatId,
        type: 'TEXT',
        content: content.trim(),
      });
      setMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message],
      );
      setContent('');
    } catch {
      setError(t('chat.failed'));
    }
  }

  async function handleMediaUpload(file: File, type: 'IMAGE' | 'VIDEO' | 'VOICE') {
    if (!accessToken || !chatId) return;

    setAttachOpen(false);
    setUploading(true);
    setError(null);

    try {
      const uploaded = await uploadMedia(accessToken, file);
      const message = await sendMessage(accessToken, {
        chatId,
        type,
        mediaUrl: uploaded.mediaUrl,
        mediaMimeType: file.type,
      });
      setMessages((current) => [...current, message]);
    } catch {
      setError(t('chat.failed'));
    } finally {
      setUploading(false);
    }
  }

  const profilePath = other?.username ? `/u/${other.username}` : undefined;

  return (
    <div className="thread-screen" lang={locale}>
      <header className="thread-header">
        <button
          type="button"
          className="thread-header__back"
          onClick={() => navigate('/chats')}
          aria-label={t('common.back')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {profilePath ? (
          <Link to={profilePath} className="thread-header__person">
            <span className={`thread-header__avatar${other?.isOnline ? ' is-online' : ''}`}>
              <Avatar name={other?.fullName ?? other?.username} imageUrl={other?.profileImage} size="xs" />
            </span>
            <span className="thread-header__meta">
              <strong>{title}</strong>
              <span className={status.online ? 'is-online' : undefined}>{status.text}</span>
            </span>
          </Link>
        ) : (
          <div className="thread-header__person">
            <span className={`thread-header__avatar${other?.isOnline ? ' is-online' : ''}`}>
              <Avatar name={other?.fullName ?? other?.username} imageUrl={other?.profileImage} size="xs" />
            </span>
            <span className="thread-header__meta">
              <strong>{title}</strong>
              <span className={status.online ? 'is-online' : undefined}>{status.text}</span>
            </span>
          </div>
        )}
      </header>

      <div className="thread-messages" ref={scrollerRef}>
        {loading ? <p className="hint thread-empty">{t('chat.loading')}</p> : null}
        {!loading && messages.length === 0 ? (
          <div className="thread-empty">
            <Avatar name={other?.fullName ?? other?.username} imageUrl={other?.profileImage} size="lg" />
            <strong>{title}</strong>
            <p>{t('chat.start')}</p>
          </div>
        ) : null}
        {grouped.map((group) => (
          <section key={group.key} className="thread-day">
            <div className="thread-day__label">
              {formatDayLabel(group.items[0].createdAt, locale, {
                today: t('chat.today'),
                yesterday: t('chat.yesterday'),
              })}
            </div>
            {group.items.map((message) => {
              const mine = message.senderId === user?.id;
              const read = message.readBy.some((receipt) => receipt.userId !== user?.id);
              return (
                <article
                  key={message.id}
                  className={`bubble${mine ? ' bubble--mine' : ' bubble--theirs'}`}
                >
                  {!mine && chat?.type === 'MEETUP_GROUP' ? (
                    <span className="bubble__sender">
                      {message.sender.fullName ?? message.sender.username}
                    </span>
                  ) : null}
                  {message.type === 'TEXT' && <p className="bubble__text">{message.content}</p>}
                  {message.type === 'IMAGE' && message.mediaUrl ? (
                    <img src={resolveMediaUrl(message.mediaUrl)} alt="" className="bubble__media" />
                  ) : null}
                  {message.type === 'VIDEO' && message.mediaUrl ? (
                    <video
                      src={resolveMediaUrl(message.mediaUrl)}
                      controls
                      playsInline
                      className="bubble__media"
                    />
                  ) : null}
                  {message.type === 'VOICE' && message.mediaUrl ? (
                    <audio src={resolveMediaUrl(message.mediaUrl)} controls className="bubble__audio" />
                  ) : null}
                  <span className="bubble__meta">
                    <time dateTime={message.createdAt}>{formatMessageTime(message.createdAt, locale)}</time>
                    {mine ? (
                      <span className={`bubble__ticks${read ? ' is-read' : ''}`} aria-label={read ? t('chat.read') : t('chat.sent')}>
                        {read ? '✓✓' : '✓'}
                      </span>
                    ) : null}
                  </span>
                </article>
              );
            })}
          </section>
        ))}
        {typingUser ? (
          <p className="thread-typing">
            <span className="thread-typing__dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            {typingName ? `${typingName} ${t('chat.typing')}` : t('chat.typing')}
          </p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="thread-composer">
        <MessageComposer
          variant="thread"
          value={content}
          onChange={handleTyping}
          onSend={() => void handleSend()}
          placeholder={t('chat.placeholder')}
          disabled={uploading}
          leading={
            <div className="attach">
              <button
                type="button"
                className="attach__btn"
                aria-label={t('chat.attach')}
                onClick={() => setAttachOpen((open) => !open)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {attachOpen ? (
                <div className="attach__menu">
                  <label>
                    {t('chat.photo')}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploading}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleMediaUpload(file, 'IMAGE');
                        event.target.value = '';
                      }}
                    />
                  </label>
                  <label>
                    {t('chat.video')}
                    <input
                      type="file"
                      accept="video/*"
                      hidden
                      disabled={uploading}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleMediaUpload(file, 'VIDEO');
                        event.target.value = '';
                      }}
                    />
                  </label>
                  <label>
                    {t('chat.voice')}
                    <input
                      type="file"
                      accept="audio/*"
                      hidden
                      disabled={uploading}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleMediaUpload(file, 'VOICE');
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>
              ) : null}
            </div>
          }
        />
        {error ? <p className="error">{error}</p> : null}
      </div>
    </div>
  );
}
