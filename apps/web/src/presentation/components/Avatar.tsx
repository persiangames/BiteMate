import { resolveMediaUrl } from '@/utils/mediaUrl';

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
  const src = resolveMediaUrl(imageUrl);
  const sizeClass = size === 'md' ? '' : ` avatar--${size}`;

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'User avatar'}
        className={`avatar${sizeClass}`}
      />
    );
  }

  return <div className={`avatar${sizeClass}`}>{initials(name)}</div>;
}
