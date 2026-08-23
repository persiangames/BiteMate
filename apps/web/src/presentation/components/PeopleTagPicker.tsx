import { useEffect, useState } from 'react';
import type { PostTagRole, UserSearchHitDto } from '@bitemate/shared';
import { POST_TAG_ROLES } from '@bitemate/shared';
import { searchUsers } from '@/data/repositories/profileRepository';
import { useAuth } from '@/presentation/context/AuthContext';
import { useI18n } from '@/presentation/context/I18nContext';

export interface SelectedTag {
  userId: string;
  username: string | null;
  fullName: string | null;
  role: PostTagRole;
}

interface PeopleTagPickerProps {
  value: SelectedTag[];
  onChange: (tags: SelectedTag[]) => void;
}

export function PeopleTagPicker({ value, onChange }: PeopleTagPickerProps) {
  const { accessToken } = useAuth();
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchHitDto[]>([]);
  const [picked, setPicked] = useState<UserSearchHitDto | null>(null);
  const [role, setRole] = useState<PostTagRole>('GUEST');

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const q = query.replace(/^@/, '').trim();
    if (q.length < 1) {
      setResults([]);
      return;
    }
    const handle = window.setTimeout(() => {
      void searchUsers(accessToken, q)
        .then(setResults)
        .catch(() => setResults([]));
    }, 220);
    return () => window.clearTimeout(handle);
  }, [accessToken, query]);

  function addTag() {
    if (!picked) {
      return;
    }
    const next = value.filter((tag) => tag.userId !== picked.id);
    onChange([
      ...next,
      {
        userId: picked.id,
        username: picked.username,
        fullName: picked.fullName,
        role,
      },
    ]);
    setPicked(null);
    setQuery('');
    setResults([]);
  }

  return (
    <div className="tag-picker flow">
      <label className="field">
        <span>{t('post.people')}</span>
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPicked(null);
          }}
          placeholder={t('post.peoplePlaceholder')}
          dir="auto"
          autoComplete="off"
        />
      </label>

      {results.length > 0 && !picked ? (
        <ul className="tag-picker__results">
          {results.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                className="tag-picker__hit"
                onClick={() => {
                  setPicked(user);
                  setQuery(`@${user.username ?? ''}`);
                  setResults([]);
                }}
              >
                <strong>@{user.username}</strong>
                <span className="hint">{user.fullName}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {picked ? (
        <div className="tag-picker__role">
          <label className="field">
            <span>{t('post.tagRole')}</span>
            <select value={role} onChange={(event) => setRole(event.target.value as PostTagRole)}>
              {POST_TAG_ROLES.map((item) => (
                <option key={item} value={item}>
                  {t(`post.tag.${item}`)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn-secondary" onClick={addTag}>
            {t('post.addTag')}
          </button>
        </div>
      ) : null}

      {value.length > 0 ? (
        <ul className="tag-chip-row">
          {value.map((tag) => (
            <li key={tag.userId} className="tag-chip">
              <span>
                @{tag.username} · {t(`post.tag.${tag.role}`)}
              </span>
              <button
                type="button"
                className="tag-chip__remove"
                onClick={() => onChange(value.filter((item) => item.userId !== tag.userId))}
                aria-label={t('common.cancel')}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
