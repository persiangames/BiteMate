import { useEffect } from 'react';
import { playClick, resumeAudioContext } from '@/utils/playClick';
import { useSound } from '@/presentation/context/SoundContext';

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
  const { soundEnabled } = useSound();

  useEffect(() => {
    if (soundEnabled) {
      resumeAudioContext();
    }
  }, [soundEnabled]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!soundEnabled) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (!target?.closest(SELECTOR)) {
        return;
      }
      playClick();
    }

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [soundEnabled]);

  return null;
}
