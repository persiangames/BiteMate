type BrandLockupProps = {
  size?: 'md' | 'lg' | 'xl';
};

const WIDTH = { md: 180, lg: 220, xl: 280 } as const;

export function BrandLockup({ size = 'lg' }: BrandLockupProps) {
  const width = WIDTH[size];

  return (
    <div className={`brand-lockup brand-lockup--${size}`}>
      <img
        src="/brand/BiteMate-logo.png"
        srcSet="/brand/lockup-320.png 320w, /brand/lockup-512.png 512w, /brand/lockup-768.png 768w, /brand/lockup-1024.png 1024w"
        sizes={`${width}px`}
        width={width}
        height={width}
        alt="BiteMate — Meet. Eat. Enjoy Together."
        decoding="async"
      />
    </div>
  );
}
