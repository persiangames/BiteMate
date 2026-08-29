import {
  countryFlagImageUrl,
  flagEmojiToIsoCode,
  isCountryFlagEmoji,
} from '@/presentation/data/countryFlagStickers';

type StickerGlyphProps = {
  sticker: string;
  className?: string;
};

export function StickerGlyph({ sticker, className }: StickerGlyphProps) {
  if (isCountryFlagEmoji(sticker)) {
    const iso = flagEmojiToIsoCode(sticker);
    if (iso) {
      return (
        <img
          className={className ?? 'sticker-picker__flag-img'}
          src={countryFlagImageUrl(iso, 40)}
          alt={iso}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      );
    }
  }

  return <span className={className}>{sticker}</span>;
}
