import { useMemo, useState } from 'react';
import { getPasswordIssues, isValidPassword } from '@bitemate/shared';
import { PasswordVisibilityToggle } from '@/presentation/components/auth/PasswordVisibilityToggle';

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
          <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible((current) => !current)} />
        </div>
      </label>
      {showRules && value.length > 0 && !valid && (
        <p className="hint password-field__rules">{rulesLabel}</p>
      )}
      {onConfirmChange != null && confirmLabel ? (
        <label className="field">
          <span>{confirmLabel}</span>
          <div className="password-field">
            <input
              type={visible ? 'text' : 'password'}
              value={confirmValue}
              onChange={(event) => onConfirmChange(event.target.value)}
              autoComplete="new-password"
              required={required}
              minLength={8}
            />
            <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible((current) => !current)} />
          </div>
        </label>
      ) : null}
      {mismatch ? <p className="error">{mismatchLabel}</p> : null}
      {value.length > 0 && !valid && issues.length > 0 ? null : null}
    </>
  );
}

export { isValidPassword };
