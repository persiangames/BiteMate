import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/presentation/context/I18nContext';
import {
  type StickerCategoryId,
  STICKER_CATEGORIES,
  readRecentStickers,
  rememberSticker,
  stickersForCategory,
} from '@/presentation/data/chatStickers';

type StickerPickerProps = {
  onPick: (sticker: string) => void;
};

const CATEGORY_ORDER: StickerCategoryId[] = [
  'RECENT',
  'SMILEYS',
  'FOOD',
  'ANIMALS',
  'ACTIVITIES',
  'TRAVEL',
  'OBJECTS',
  'SYMBOLS',
  'FLAGS',
];

export function StickerPicker({ onPick }: StickerPickerProps) {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState<StickerCategoryId>('SMILEYS');
  const [recentVersion, setRecentVersion] = useState(0);

  const recentCount = useMemo(() => readRecentStickers().length, [recentVersion]);

  useEffect(() => {
    if (activeCategory === 'RECENT' && recentCount === 0) {
      setActiveCategory('SMILEYS');
    }
  }, [activeCategory, recentCount]);

  const stickers = useMemo(
    () => stickersForCategory(activeCategory),
    [activeCategory, recentVersion],
  );

  function handlePick(sticker: string) {
    rememberSticker(sticker);
    setRecentVersion((version) => version + 1);
    onPick(sticker);
  }

  function categoryIcon(id: StickerCategoryId): string {
    if (id === 'RECENT') return '🕘';
    return STICKER_CATEGORIES.find((category) => category.id === id)?.icon ?? '😀';
  }

  return (
    <div className="sticker-picker" role="region" aria-label={t('chat.stickers')}>
      <div className="sticker-picker__grid" role="listbox" aria-label={t(`chat.stickerCategory.${activeCategory}`)}>
        {stickers.length === 0 ? (
          <p className="sticker-picker__empty hint">{t('chat.stickersRecentEmpty')}</p>
        ) : (
          stickers.map((sticker) => (
            <button
              key={`${activeCategory}-${sticker}`}
              type="button"
              className="sticker-picker__item"
              role="option"
              aria-label={sticker}
              onClick={() => handlePick(sticker)}
            >
              {sticker}
            </button>
          ))
        )}
      </div>

      <div className="sticker-picker__tabs" role="tablist" aria-label={t('chat.stickerCategories')}>
        {CATEGORY_ORDER.map((categoryId) => {
          if (categoryId === 'RECENT' && recentCount === 0) {
            return null;
          }
          const active = activeCategory === categoryId;
          return (
            <button
              key={categoryId}
              type="button"
              role="tab"
              aria-selected={active}
              className={`sticker-picker__tab${active ? ' active' : ''}`}
              aria-label={t(`chat.stickerCategory.${categoryId}`)}
              title={t(`chat.stickerCategory.${categoryId}`)}
              onClick={() => setActiveCategory(categoryId)}
            >
              {categoryIcon(categoryId)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
