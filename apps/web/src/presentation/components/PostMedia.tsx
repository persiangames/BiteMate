import { useEffect, useMemo, useState } from 'react';
import type { MediaType } from '@bitemate/shared';
import { uploadUrlCandidates } from '@/utils/mediaUrl';

type PostMediaProps = {
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  alt?: string;
  className?: string;
};

export function PostMedia({ mediaType, mediaUrl, thumbnailUrl, alt = '', className = 'post-media' }: PostMediaProps) {
  const mediaCandidates = useMemo(() => uploadUrlCandidates(mediaUrl), [mediaUrl]);
  const posterCandidates = useMemo(() => uploadUrlCandidates(thumbnailUrl), [thumbnailUrl]);
  const [mediaIndex, setMediaIndex] = useState(0);

  useEffect(() => {
    setMediaIndex(0);
  }, [mediaUrl]);

  const mediaSrc = mediaCandidates[mediaIndex];
  const posterSrc = posterCandidates[0];

  function tryNextMedia() {
    setMediaIndex((current) => (current + 1 < mediaCandidates.length ? current + 1 : current));
  }

  if (!mediaSrc) {
    return <div className={`${className} post-media--missing`} aria-hidden />;
  }

  if (mediaType === 'IMAGE') {
    return (
      <img
        src={mediaSrc}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        onError={tryNextMedia}
      />
    );
  }

  return (
    <video
      src={mediaSrc}
      poster={posterSrc}
      controls
      playsInline
      preload="metadata"
      className={className}
      onError={tryNextMedia}
    />
  );
}
