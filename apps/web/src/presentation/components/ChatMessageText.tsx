import {
  countryFlagImageUrl,
  splitTextWithCountryFlags,
} from '@/presentation/data/countryFlagStickers';

type ChatMessageTextProps = {
  text: string;
  className?: string;
};

export function ChatMessageText({ text, className }: ChatMessageTextProps) {
  const segments = splitTextWithCountryFlags(text);

  if (segments.length === 1 && segments[0]?.type === 'text') {
    return <p className={className}>{text}</p>;
  }

  return (
    <p className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={`t-${index}`}>{segment.value}</span>;
        }
        return (
          <img
            key={`f-${index}-${segment.iso}`}
            className="bubble__flag"
            src={countryFlagImageUrl(segment.iso, 20)}
            alt={segment.iso}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        );
      })}
    </p>
  );
}
