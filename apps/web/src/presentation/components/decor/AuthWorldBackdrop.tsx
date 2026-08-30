type AuthWorldBackdropProps = {
  tone?: 'intro' | 'form';
};

/** Real vector world map wallpaper — uses /brand/world-map.svg (Wikimedia). */
export function AuthWorldBackdrop({ tone = 'form' }: AuthWorldBackdropProps) {
  return (
    <div className={`auth-world-backdrop auth-world-backdrop--${tone}`} aria-hidden>
      <div className="auth-world-backdrop__map auth-world-backdrop__map--base" />
      <div className="auth-world-backdrop__map auth-world-backdrop__map--relief" />
    </div>
  );
}
