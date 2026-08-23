import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type MediaSheetProps = {
  title: string;
  hint?: string;
  onClose: () => void;
  children: ReactNode;
};

export function MediaSheet({ title, hint, onClose, children }: MediaSheetProps) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="media-sheet"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="media-sheet__card" role="dialog" aria-modal="true" aria-labelledby="media-sheet-title">
        <h2 id="media-sheet-title">{title}</h2>
        {hint ? <p className="hint">{hint}</p> : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
