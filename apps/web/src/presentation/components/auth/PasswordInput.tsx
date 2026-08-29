import { useState } from 'react';
import { PasswordVisibilityToggle } from '@/presentation/components/auth/PasswordVisibilityToggle';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
  required = true,
  minLength,
  className = 'password-field password-field--inline',
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
      />
      <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible((current) => !current)} />
    </div>
  );
}
