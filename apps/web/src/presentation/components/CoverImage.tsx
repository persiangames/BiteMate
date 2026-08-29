import { useEffect, useMemo, useState } from 'react';
import { uploadUrlCandidates } from '@/utils/mediaUrl';

interface CoverImageProps {
  imageUrl?: string | null;
  className?: string;
  emptyClassName?: string;
}

export function CoverImage({ imageUrl, className, emptyClassName = 'ig-profile__cover-empty' }: CoverImageProps) {
  const candidates = useMemo(() => uploadUrlCandidates(imageUrl), [imageUrl]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [imageUrl]);

  const src = candidates[index];

  if (src && index < candidates.length) {
    return (
      <img
        src={src}
        alt=""
        className={className}
        loading="lazy"
        decoding="async"
        onError={() => {
          setIndex((current) => current + 1);
        }}
      />
    );
  }

  return <div className={emptyClassName} aria-hidden />;
}
