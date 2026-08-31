import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { PostDto } from '@bitemate/shared';
import { MIN_PROFILE_COMPLETION_FOR_EVENTS } from '@bitemate/shared';
import {
  addComment,
  deletePost,
  fetchComments,
  sharePost,
  toggleFollow,
  toggleLike,
  updatePost,
} from '@/data/repositories/feedRepository';
import { requestMeetupJoin } from '@/data/repositories/meetupRepository';
import { Avatar } from '@/presentation/components/Avatar';
import { MessageComposer } from '@/presentation/components/MessageComposer';
import { SaveFeedback } from '@/presentation/components/SaveFeedback';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';
import { PostMedia } from '@/presentation/components/PostMedia';

interface PostCardProps {
  post: PostDto;
  accessToken: string;
  onUpdate: (post: PostDto) => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, accessToken, onUpdate, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Array<{
    id: string;
    content: string;
    author: string;
    username: string | null;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(post.caption ?? '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOwner = user?.id === post.author.id;

  async function handleLike() {
    const result = await toggleLike(accessToken, post.id);
    onUpdate({
      ...post,
      isLiked: result.liked,
      likeCount: result.likeCount,
    });
  }

  async function handleFollow() {
    const result = await toggleFollow(accessToken, post.author.id);
    onUpdate({
      ...post,
      isFollowingAuthor: result.following,
    });
  }

  async function handleShare() {
    const result = await sharePost(accessToken, post.id);
    onUpdate({ ...post, shareCount: result.shareCount });

    if (navigator.share) {
      await navigator.share({
        title: t('app.name'),
        url: window.location.origin + result.shareUrl,
      }).catch(() => undefined);
    }
  }

  async function handleCommentSubmit() {
    if (!commentText.trim()) {
      return;
    }

    setLoading(true);
    try {
      const created = await addComment(accessToken, post.id, { content: commentText.trim() });
      setCommentText('');
      onUpdate({ ...post, commentCount: post.commentCount + 1 });
      setComments((current) => [
        {
          id: created.id,
          content: created.content,
          author: created.author.fullName ?? created.author.username ?? t('post.user'),
          username: created.author.username,
        },
        ...current,
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function openComments() {
    setCommentsOpen(true);
    const response = await fetchComments(accessToken, post.id);
    setComments(
      response.items.map((item) => ({
        id: item.id,
        content: item.content,
        author: item.author.fullName ?? item.author.username ?? t('post.user'),
        username: item.author.username,
      })),
    );
  }

  async function saveCaption() {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updatePost(accessToken, post.id, { caption: captionDraft });
      onUpdate(updated);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setError(localizeError(t, err, 'save.failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(t('post.deleteConfirm'))) {
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      await deletePost(accessToken, post.id);
      onDelete?.(post.id);
    } catch (err) {
      setError(localizeError(t, err, 'post.deleteFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinEvent() {
    const meetup = post.meetup;
    if (!meetup || meetup.isFull || meetup.status === 'CANCELLED' || meetup.status === 'EXPIRED') {
      return;
    }
    if (user?.id === post.author.id) {
      navigate('/meetups');
      return;
    }

    const completion = user?.profileCompletionPercent ?? 0;
    if (completion < MIN_PROFILE_COMPLETION_FOR_EVENTS) {
      setJoinMessage(
        t('profile.completion.eventGateHint', {
          percent: completion,
          min: MIN_PROFILE_COMPLETION_FOR_EVENTS,
        }),
      );
      return;
    }

    setJoining(true);
    setJoinMessage(null);
    try {
      const invite = await requestMeetupJoin(accessToken, { meetupId: meetup.id });
      setJoinMessage(t('meetups.accepted'));
      if (invite.meetup.roomId) {
        navigate(`/meetups/room/${invite.meetup.roomId}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setJoinMessage(
        message.toLowerCase().includes('full') ? t('meetups.full') : t('error.generic'),
      );
    } finally {
      setJoining(false);
    }
  }

  const authorName = post.author.fullName ?? post.author.username ?? t('post.user');
  const meetup = post.meetup;
  const canJoinEvent =
    meetup &&
    !meetup.isFull &&
    meetup.status !== 'CANCELLED' &&
    meetup.status !== 'EXPIRED' &&
    user?.id !== post.author.id;

  return (
    <article className="glass-card post-card flow">
      <header className="post-header">
        <Avatar
          name={authorName}
          imageUrl={post.author.profileImage}
        />
        <div className="post-header__meta">
          {post.author.username ? (
            <Link to={`/u/${post.author.username}`} className="post-author-link">
              <strong>{authorName}</strong>
            </Link>
          ) : (
            <strong>{authorName}</strong>
          )}
          <p className="hint">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
        {isOwner ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setEditing((open) => !open);
              setCaptionDraft(post.caption ?? '');
              setSaved(false);
              setError(null);
            }}
          >
            {t('post.edit')}
          </button>
        ) : null}
        {!isOwner && !post.isFollowingAuthor && post.author.id ? (
          <button type="button" className="btn-secondary" onClick={handleFollow}>
            {post.isFollowingAuthor ? t('post.following') : t('post.follow')}
          </button>
        ) : null}
      </header>

      {meetup ? (
        <section className="post-event-banner">
          <div className="post-event-banner__head">
            <span className="event-badge">{t('feed.eventBadge')}</span>
            {meetup.mealSlot ? (
              <span className="hint">{t(`dining.meal.${meetup.mealSlot}`)}</span>
            ) : null}
          </div>
          <strong>{meetup.foodName ?? meetup.foodType}</strong>
          <p className="hint">
            {new Date(meetup.scheduledAt).toLocaleString()}
            {meetup.locationLabel || meetup.city
              ? ` · ${meetup.locationLabel ?? meetup.city}`
              : ''}
          </p>
          <div className="post-event-banner__meta">
            {meetup.isFull ? (
              <span className="full-badge">{t('meetups.full')}</span>
            ) : (
              <span className="seats-badge">
                {t('meetups.seatsLeft', { count: meetup.seatsLeft })}
              </span>
            )}
            {meetup.preferredInterests.slice(0, 3).map((interest) => (
              <span key={interest} className="filter-chip active">
                {t(`profile.interest.${interest}`)}
              </span>
            ))}
          </div>
          {canJoinEvent ? (
            <button
              type="button"
              className="btn-primary btn-compact"
              disabled={joining}
              onClick={() => void handleJoinEvent()}
            >
              {joining ? t('common.loading') : t('meetups.join')}
            </button>
          ) : null}
          {user?.id === post.author.id ? (
            <Link to={meetup ? `/meetups/${meetup.id}` : '/meetups'} className="btn-secondary btn-compact">
              {t('feed.manageEvent')}
            </Link>
          ) : meetup ? (
            <Link to={`/meetups/${meetup.id}`} className="btn-secondary btn-compact">
              {t('event.viewDetails')}
            </Link>
          ) : null}
          {joinMessage ? (
            <div className="profile-gate profile-gate--inline">
              <p className="hint">{joinMessage}</p>
              <Link to="/profile/edit?highlight=1" className="btn-secondary btn-compact">
                {t('profile.completion.action')}
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      <PostMedia
        mediaType={post.mediaType}
        mediaUrl={post.mediaUrl}
        thumbnailUrl={post.thumbnailUrl}
        alt={post.caption ?? ''}
      />

      {editing ? (
        <div className="flow post-edit-panel">
          <label className="field">
            <span>{t('post.caption')}</span>
            <textarea
              value={captionDraft}
              onChange={(event) => setCaptionDraft(event.target.value)}
              rows={3}
            />
          </label>
          <SaveFeedback saved={saved} error={error} successKey="save.success" />
          <div className="post-edit-panel__actions">
            <button
              type="button"
              className="btn-primary"
              disabled={loading}
              onClick={() => void saveCaption()}
            >
              {loading ? t('save.saving') : t('post.saveCaption')}
            </button>
            <button
              type="button"
              className="btn-ghost"
              disabled={loading}
              onClick={() => {
                setEditing(false);
                setCaptionDraft(post.caption ?? '');
                setError(null);
                setSaved(false);
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="btn-danger"
              disabled={loading}
              onClick={() => void handleDelete()}
            >
              {t('post.delete')}
            </button>
          </div>
        </div>
      ) : (
        post.caption ? <p>{post.caption}</p> : null
      )}

      {!editing ? <SaveFeedback saved={saved} error={error} successKey="save.success" /> : null}

      <div className="flow horizontal">
        {post.restaurantTag && <span className="restaurant-tag">🍽 {post.restaurantTag}</span>}
        {post.locationLabel && <span className="location-badge">📍 {post.locationLabel}</span>}
      </div>

      {post.tags?.length ? (
        <ul className="post-tag-list">
          {post.tags.map((tag) => (
            <li key={`${tag.userId}-${tag.role}`}>
              {tag.username ? (
                <Link to={`/u/${tag.username}`} className="post-tag-link">
                  @{tag.username}
                </Link>
              ) : (
                <strong>{tag.fullName ?? t('post.user')}</strong>
              )}
              <span className="hint"> · {t(`post.tag.${tag.role}`)}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="post-actions">
        <button type="button" className="icon-btn" onClick={handleLike}>
          {post.isLiked ? '❤️' : '🤍'} {t('post.likes', { count: post.likeCount })}
        </button>
        <button type="button" className="icon-btn" onClick={openComments}>
          💬 {post.commentCount}
        </button>
        <button type="button" className="icon-btn" onClick={handleShare}>
          ↗ {post.shareCount}
        </button>
      </div>

      {commentsOpen && (
        <div className="flow">
          <MessageComposer
            value={commentText}
            onChange={setCommentText}
            onSend={() => void handleCommentSubmit()}
            placeholder={t('post.writeComment')}
            disabled={loading}
            sendLabel={t('post.comment')}
          />
          <ul className="comment-list">
            {comments.map((comment) => (
              <li key={comment.id}>
                {comment.username ? (
                  <Link to={`/u/${comment.username}`}>@{comment.username}</Link>
                ) : (
                  <strong>{comment.author}</strong>
                )}
                : {comment.content}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
