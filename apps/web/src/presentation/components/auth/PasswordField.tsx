import { useMemo, useState } from 'react';
import { getPasswordIssues, isValidPassword } from '@bitemate/shared';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  confirmLabel?: string;
  confirmValue?: string;
  onConfirmChange?: (value: string) => void;
  showRules?: boolean;
  rulesLabel: string;
  mismatchLabel: string;
  required?: boolean;
}

export function PasswordField({
  label,
  value,
  onChange,
  confirmLabel,
  confirmValue = '',
  onConfirmChange,
  showRules = true,
  rulesLabel,
  mismatchLabel,
  required = true,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const issues = useMemo(() => getPasswordIssues(value), [value]);
  const valid = isValidPassword(value);
  const mismatch =
    onConfirmChange != null && confirmValue.length > 0 && confirmValue !== value;

  return (
    <>
      <label className="field">
        <span>{label}</span>
        <div className="password-field">
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoComplete="new-password"
            required={required}
            minLength={8}
          />
          <button
            type="button"
            className="password-field__toggle"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? '🙈' : '👁'}
          </button>
        </div>
      </label>
      {showRules && value.length > 0 && !valid && (
        <p className="hint password-field__rules">{rulesLabel}</p>
      )}
      {onConfirmChange != null && confirmLabel ? (
        <label className="field">
          <span>{confirmLabel}</span>
          <input
            type={visible ? 'text' : 'password'}
            value={confirmValue}
            onChange={(event) => onConfirmChange(event.target.value)}
            autoComplete="new-password"
            required={required}
            minLength={8}
          />
        </label>
      ) : null}
      {mismatch ? <p className="error">{mismatchLabel}</p> : null}
      {value.length > 0 && !valid && issues.length > 0 ? null : null}
    </>
  );
}

export { isValidPassword };
