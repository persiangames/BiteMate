import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ChatMessageType, ChatSummaryDto } from '@bitemate/shared';
import { connectRealtime, onChatMessage, onPresenceUpdate } from '@/data/api/socketClient';
import { fetchChats } from '@/data/repositories/chatRepository';
import { Avatar } from '@/presentation/components/Avatar';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { formatInboxTime } from '@/presentation/utils/chatTime';

function previewFor(chat: ChatSummaryDto, t: (key: string) => string): string {
  if (chat.lastMessageType === 'IMAGE') return t('chat.photo');
  if (chat.lastMessageType === 'VIDEO') return t('chat.video');
  if (chat.lastMessageType === 'VOICE') return t('chat.voice');
  return chat.lastMessagePreview?.trim() || t('chat.noMessages');
}

function typeIcon(type: ChatMessageType | null): string {
  if (type === 'IMAGE') return '📷';
  if (type === 'VIDEO') return '🎬';
  if (type === 'VOICE') return '🎤';
  return '';
}

export function ChatsPage() {
  const { accessToken, user } = useAuth();
  const { t, locale } = useI18n();
  const [chats, setChats] = useState<ChatSummaryDto[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    connectRealtime(accessToken);

    async function load() {
      setError(null);
      try {
        const response = await fetchChats(accessToken!);
        setChats(response.items);
      } catch {
        setError('chat.loadFailed');
      } finally {
        setLoading(false);
      }
    }

    void load();

    const unsubPresence = onPresenceUpdate(() => {
      void load();
    });
    const unsubMessage = onChatMessage(() => {
      void load();
    });

    return () => {
      unsubPresence();
      unsubMessage();
    };
  }, [accessToken]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return chats;
    return chats.filter((chat) => {
      const other =
        chat.participants.find((participant) => participant.id !== user?.id) ?? chat.participants[0];
      const title = chat.title ?? other?.fullName ?? other?.username ?? '';
      const preview = chat.lastMessagePreview ?? '';
      return `${title} ${other?.username ?? ''} ${preview}`.toLowerCase().includes(needle);
    });
  }, [chats, query, user?.id]);

  return (
    <div className="inbox" lang={locale}>
      <header className="inbox__header">
        <h1>{t('chat.title')}</h1>
      </header>

      <label className="inbox__search">
        <span className="inbox__search-icon" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('chat.search')}
          autoComplete="off"
        />
      </label>

      {loading ? <p className="hint inbox__status">{t('chat.loading')}</p> : null}
      {error ? <p className="error inbox__status">{t(error)}</p> : null}

      {!loading && chats.length === 0 ? (
        <div className="inbox__empty">
          <strong>{t('chat.title')}</strong>
          <p className="hint">{t('chat.empty')}</p>
        </div>
      ) : null}

      {!loading && chats.length > 0 && filtered.length === 0 ? (
        <p className="hint inbox__status">{t('chat.searchEmpty')}</p>
      ) : null}

      <div className="inbox__list">
        {filtered.map((chat) => {
          const other =
            chat.participants.find((participant) => participant.id !== user?.id) ??
            chat.participants[0];
          const title = chat.title ?? other?.fullName ?? other?.username ?? t('chat.title');
          const unread = chat.unreadCount > 0;
          const preview = previewFor(chat, t);
          const icon = typeIcon(chat.lastMessageType);

          return (
            <Link
              key={chat.id}
              to={`/chats/${chat.id}`}
              className={`inbox-row${unread ? ' inbox-row--unread' : ''}`}
            >
              <span className={`inbox-row__avatar${other?.isOnline ? ' is-online' : ''}`}>
                <Avatar name={other?.fullName ?? other?.username} imageUrl={other?.profileImage} size="sm" />
              </span>
              <span className="inbox-row__body">
                <span className="inbox-row__top">
                  <strong className="inbox-row__name">{title}</strong>
                  <time className="inbox-row__time" dateTime={chat.lastMessageAt ?? undefined}>
                    {formatInboxTime(chat.lastMessageAt, locale, { yesterday: t('chat.yesterday') })}
                  </time>
                </span>
                <span className="inbox-row__bottom">
                  <span className="inbox-row__preview">
                    {chat.type === 'MEETUP_GROUP' ? `${t('chat.meetup')} · ` : ''}
                    {icon ? `${icon} ` : ''}
                    {preview}
                  </span>
                  {unread ? <span className="inbox-row__badge">{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</span> : null}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
