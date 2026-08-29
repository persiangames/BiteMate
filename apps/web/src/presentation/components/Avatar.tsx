import { useEffect, useMemo, useState } from 'react';
import { uploadUrlCandidates } from '@/utils/mediaUrl';

function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

interface AvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  const candidates = useMemo(() => uploadUrlCandidates(imageUrl), [imageUrl]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [imageUrl]);

  const sizeClass = size === 'md' ? '' : ` avatar--${size}`;
  const src = candidates[index];

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'User avatar'}
        className={`avatar${sizeClass}`}
        loading="lazy"
        decoding="async"
        onError={() => {
          setIndex((current) => (current + 1 < candidates.length ? current + 1 : candidates.length));
        }}
      />
    );
  }

  return <div className={`avatar${sizeClass}`}>{initials(name)}</div>;
}
