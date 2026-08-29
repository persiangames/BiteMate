'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { AdminPostDto, AdminUserDetailDto, AdminUserPostsResponseDto } from '@bitemate/shared';
import { USER_ROLE_LABELS } from '@bitemate/shared';
import { AdminShell } from '@/components/AdminShell';
import { StatusPill } from '@/components/ui';
import { useAdminAuth } from '@/lib/auth';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api').replace(/\/$/, '');

function formatJoinedAt(iso: string): string {
  return new Date(iso).toLocaleString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function resolveMediaUrl(stored: string | null | undefined): string | undefined {
  if (!stored) {
    return undefined;
  }
  if (stored.startsWith('http://') || stored.startsWith('https://') || stored.startsWith('blob:')) {
    const s3Match = stored.match(/amazonaws\.com\/([^?#]+)/i);
    if (s3Match) {
      return `${API_BASE}/uploads/${decodeURIComponent(s3Match[1]).replace(/\//g, '_')}`;
    }
    return stored;
  }
  if (stored.startsWith('/uploads/')) {
    return `${API_BASE}${stored}`;
  }
  return `${API_BASE}/uploads/${stored.replace(/\//g, '_')}`;
}

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { request } = useAdminAuth();
  const [user, setUser] = useState<AdminUserDetailDto | null>(null);
  const [posts, setPosts] = useState<AdminUserPostsResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);

  async function load() {
    const [detail, postList] = await Promise.all([
      request<AdminUserDetailDto>(`/admin/users/${userId}`),
      request<AdminUserPostsResponseDto>(`/admin/users/${userId}/posts?page=1&limit=40`),
    ]);
    setUser(detail);
    setPosts(postList);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : 'Failed to load user'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function deletePost(post: AdminPostDto) {
    const reason = window.prompt(
      'Reason for removal (sent to the user as a community guidelines warning):',
      'This post violates BiteMate community guidelines.',
    );
    if (reason === null) {
      return;
    }

    setBusyPostId(post.id);
    try {
      await request(`/admin/posts/${post.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason, warnUser: true }),
      });
      setPosts((current) =>
        current
          ? {
              ...current,
              items: current.items.filter((item) => item.id !== post.id),
              total: Math.max(0, current.total - 1),
            }
          : current,
      );
      setUser((current) =>
        current ? { ...current, postCount: Math.max(0, current.postCount - 1) } : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setBusyPostId(null);
    }
  }

  if (!user) {
    return (
      <AdminShell>
        <p className="text-slate-500">{error ?? 'Loading user…'}</p>
      </AdminShell>
    );
  }

  const avatarSrc = resolveMediaUrl(user.profileImage);

  return (
    <AdminShell>
      <div className="mb-6">
        <Link href="/users" className="text-sm text-brand hover:underline">
          ← Back to users
        </Link>
      </div>

      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-lg font-semibold text-slate-500">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                (user.fullName ?? user.username ?? 'U').slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{user.fullName ?? user.username ?? 'Unnamed'}</h1>
              <p className="text-sm text-slate-500">@{user.username ?? '—'}</p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Email / Phone</dt>
              <dd className="font-medium">{user.email ?? user.phoneNumber ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Joined</dt>
              <dd className="font-medium">{formatJoinedAt(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Role</dt>
              <dd>{user.role ? USER_ROLE_LABELS[user.role] : '—'}</dd>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <StatusPill value={user.isActive ? 'Active' : 'Banned'} tone={user.isActive ? 'ok' : 'danger'} />
              {user.adminVerified ? <StatusPill value="Verified" tone="ok" /> : null}
              {user.isPremium ? <StatusPill value="Premium" tone="warn" /> : null}
            </div>
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Account metrics</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Metric label="Followers" value={user.followerCount} />
            <Metric label="Following" value={user.followingCount} />
            <Metric label="Posts" value={user.postCount} />
            <Metric label="Ranking" value={`#${user.rankingPosition}`} />
            <Metric label="Rank score" value={user.rankScore.toFixed(1)} />
            <Metric label="Level" value={user.level} />
            <Metric label="Meetups" value={user.successfulMeetups} />
          </div>
          {user.bio ? <p className="mt-5 text-sm text-slate-600">{user.bio}</p> : null}
        </section>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Posts</h2>
            <p className="text-sm text-slate-500">Remove inappropriate posts and warn the user automatically.</p>
          </div>
          <span className="text-sm text-slate-500">{posts?.total ?? 0} total</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts?.items.map((post) => {
            const mediaSrc = resolveMediaUrl(post.mediaUrl);
            const thumbSrc = resolveMediaUrl(post.thumbnailUrl);
            return (
              <article key={post.id} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="aspect-square bg-slate-100">
                  {post.mediaType === 'VIDEO' && mediaSrc ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={mediaSrc} poster={thumbSrc} controls className="h-full w-full object-cover" />
                  ) : mediaSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaSrc} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">No media</div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <p className="line-clamp-3 text-sm text-slate-700">{post.caption ?? 'No caption'}</p>
                  <p className="text-xs text-slate-500">
                    {formatJoinedAt(post.createdAt)} · {post.likeCount} likes · {post.commentCount} comments
                  </p>
                  <button
                    type="button"
                    disabled={busyPostId === post.id}
                    className="text-sm font-medium text-rose-600 hover:underline disabled:opacity-50"
                    onClick={() => void deletePost(post)}
                  >
                    {busyPostId === post.id ? 'Removing…' : 'Remove & warn user'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {!posts?.items.length ? (
          <p className="mt-6 text-center text-sm text-slate-500">This user has no posts yet.</p>
        ) : null}
      </section>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
