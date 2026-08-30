import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/presentation/context/I18nContext';

export function FeedFab() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="feed-fab" ref={rootRef}>
      {open ? (
        <div className="feed-fab__menu" role="menu" aria-label={t('feed.createMenu')}>
          <Link
            to="/feed/create"
            className="feed-fab__option"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span className="feed-fab__option-icon" aria-hidden>
              📝
            </span>
            <span className="feed-fab__option-copy">
              <strong>{t('post.new')}</strong>
              <small>{t('feed.createPostHint')}</small>
            </span>
          </Link>
          <Link
            to="/feed/create-event"
            className="feed-fab__option feed-fab__option--event"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span className="feed-fab__option-icon" aria-hidden>
              🍽️
            </span>
            <span className="feed-fab__option-copy">
              <strong>{t('event.new')}</strong>
              <small>{t('feed.createEventHint')}</small>
            </span>
          </Link>
        </div>
      ) : null}

      <button
        type="button"
        className={`fab${open ? ' fab--open' : ''}`}
        aria-label={t('feed.createMenu')}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="fab__plus" aria-hidden>
          {open ? '×' : '+'}
        </span>
      </button>
    </div>
  );
}
