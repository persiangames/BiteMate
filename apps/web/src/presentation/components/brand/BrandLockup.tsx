import { useI18n } from '@/presentation/context/I18nContext';
import { ICON_MARK_VERSION } from '@/presentation/components/brand/icon-mark.version';

type BrandLockupProps = {
  size?: 'md' | 'lg' | 'xl';
  /** Text colors: dark hero uses light text; auth card uses dark text */
  tone?: 'light' | 'dark';
  showTagline?: boolean;
};

const ICON_PX = { md: 68, lg: 92, xl: 112 } as const;

export function BrandLockup({ size = 'lg', tone = 'dark', showTagline = true }: BrandLockupProps) {
  const { t } = useI18n();
  const px = ICON_PX[size];

  return (
    <div className={`brand-lockup brand-lockup--${size} brand-lockup--tone-${tone} brand-elevated`}>
      <img
        className="brand-lockup__mark"
        src={`/brand/icon-mark.png?v=${ICON_MARK_VERSION}`}
        width={px}
        height={px}
        alt="BiteMate"
        decoding="async"
      />
      <span className="brand-lockup__word">BiteMate</span>
      {showTagline ? (
        <p className="brand-lockup__tagline">{t('landing.footer.tagline')}</p>
      ) : null}
    </div>
  );
}
