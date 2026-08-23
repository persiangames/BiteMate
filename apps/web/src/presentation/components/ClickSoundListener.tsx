import { useEffect } from 'react';
import { playClick } from '@/utils/playClick';

const SELECTOR = [
  'button',
  'a',
  '[role="button"]',
  'label.button-like',
  '.quick-link',
  '.settings-row',
  '.bottom-nav__item',
  '.filter-chip',
  '.icon-btn',
  '.back-btn',
].join(',');

export function ClickSoundListener() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(SELECTOR)) {
        return;
      }
      playClick();
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
