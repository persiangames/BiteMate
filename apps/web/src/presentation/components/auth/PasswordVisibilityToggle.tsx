type PasswordVisibilityToggleProps = {
  visible: boolean;
  onToggle: () => void;
  showLabel?: string;
  hideLabel?: string;
};

function EyeOpenIcon() {
  return (
    <svg className="password-field__toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
        d="M2.036 12.322a1 1 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .638C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="password-field__toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

export function PasswordVisibilityToggle({
  visible,
  onToggle,
  showLabel = 'Show password',
  hideLabel = 'Hide password',
}: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      className="password-field__toggle"
      onClick={onToggle}
      aria-label={visible ? hideLabel : showLabel}
      tabIndex={-1}
    >
      {visible ? <EyeOpenIcon /> : <EyeOffIcon />}
    </button>
  );
}
