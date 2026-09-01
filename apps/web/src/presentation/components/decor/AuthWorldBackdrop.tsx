type AuthWorldBackdropProps = {
  tone?: 'intro' | 'form';
};

/** Food-themed premium backdrop for login / register. */
export function AuthWorldBackdrop({ tone = 'form' }: AuthWorldBackdropProps) {
  return (
    <div className={`auth-world-backdrop auth-world-backdrop--${tone}`} aria-hidden>
      <div className="auth-world-backdrop__photo" />
      <div className="auth-world-backdrop__scrim" />
      <div className="auth-world-backdrop__map auth-world-backdrop__map--base" />
      <div className="auth-world-backdrop__map auth-world-backdrop__map--relief" />
    </div>
  );
}
