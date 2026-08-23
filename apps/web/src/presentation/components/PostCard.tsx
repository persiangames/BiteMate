import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { PostDto } from '@bitemate/shared';
import {
  addComment,
  fetchComments,
  sharePost,
  toggleFollow,
  toggleLike,
  updatePost,
} from '@/data/repositories/feedRepository';
import { Avatar } from '@/presentation/components/Avatar';
import { MessageComposer } from '@/presentation/components/MessageComposer';
import { SaveFeedback } from '@/presentation/components/SaveFeedback';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';
import { localizeError } from '@/presentation/i18n/localizeError';
import { resolveMediaUrl } from '@/utils/mediaUrl';

interface PostCardProps {
  post: PostDto;
  accessToken: string;
  onUpdate: (post: PostDto) => void;
}

export function PostCard({ post, accessToken, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [commentText, setCommentText] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Array<{
    id: string;
    content: string;
    author: string;
    username: string | null;
  }>>([]);
  const [loading, setLoading] = useState(false);
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

  const authorName = post.author.fullName ?? post.author.username ?? t('post.user');

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

      {post.mediaType === 'IMAGE' ? (
        <img src={resolveMediaUrl(post.mediaUrl)} alt={post.caption ?? ''} className="post-media" />
      ) : (
        <video
          src={resolveMediaUrl(post.mediaUrl)}
          poster={resolveMediaUrl(post.thumbnailUrl) ?? undefined}
          controls
          playsInline
          className="post-media"
        />
      )}

      {editing ? (
        <div className="flow">
          <label className="field">
            <span>{t('post.caption')}</span>
            <textarea
              value={captionDraft}
              onChange={(event) => setCaptionDraft(event.target.value)}
              rows={3}
            />
          </label>
          <SaveFeedback saved={saved} error={error} successKey="save.success" />
          <button
            type="button"
            className="btn-primary"
            disabled={loading}
            onClick={() => void saveCaption()}
          >
            {loading ? t('save.saving') : t('post.saveCaption')}
          </button>
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
