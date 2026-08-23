import { useEffect, useMemo, useRef, useState } from 'react';
import type { SelectOption } from '@/data/i18n-lists';
import { useI18n } from '@/presentation/context/I18nContext';

interface SearchableSelectProps {
  label: string;
  value: string;
  options: Array<string | SelectOption>;
  placeholder?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  formatSelected?: (value: string) => string;
  extraOptions?: Array<string | SelectOption>;
  onQueryChange?: (query: string) => void;
  onChange: (value: string) => void;
}

function toOption(option: string | SelectOption): SelectOption {
  return typeof option === 'string' ? { value: option, label: option } : option;
}

export function SearchableSelect({
  label,
  value,
  options,
  placeholder,
  disabled,
  allowCustom,
  formatSelected,
  extraOptions,
  onQueryChange,
  onChange,
}: SearchableSelectProps) {
  const { t } = useI18n();
  const normalized = useMemo(() => options.map(toOption), [options]);
  const extras = useMemo(() => (extraOptions ?? []).map(toOption), [extraOptions]);
  const selectedLabel =
    extras.find((option) => option.value === value)?.label ??
    normalized.find((option) => option.value === value)?.label ??
    (value ? formatSelected?.(value) ?? value : '');
  const [query, setQuery] = useState(selectedLabel);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    setQuery(selectedLabel);
  }, [selectedLabel]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(selectedLabel);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [selectedLabel]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered =
      needle.length < 2
        ? normalized
        : normalized.filter(
            (option) =>
              option.label.toLowerCase().includes(needle) ||
              option.value.toLowerCase().includes(needle),
          );
    const extra = extras.filter((option) => !filtered.some((item) => item.value === option.value));
    return [...extra, ...filtered].slice(0, 80);
  }, [normalized, extras, query]);

  const trimmed = query.trim();
  const exactMatch = normalized.some(
    (option) =>
      option.label.toLowerCase() === trimmed.toLowerCase() ||
      option.value.toLowerCase() === trimmed.toLowerCase(),
  );
  const canAddCustom = Boolean(allowCustom && trimmed.length >= 2 && !exactMatch);

  function commit(nextValue: string, nextLabel = nextValue) {
    onChange(nextValue);
    setQuery(nextLabel);
    setOpen(false);
  }

  return (
    <label className="field searchable-select" ref={rootRef}>
      <span>{label}</span>
      <input
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => {
          setOpen(true);
          onQueryChange?.(query);
        }}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          setOpen(true);
          onQueryChange?.(next);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && canAddCustom) {
            event.preventDefault();
            commit(trimmed);
          }
        }}
      />
      {open && !disabled ? (
        <ul className="searchable-select__menu" role="listbox">
          {canAddCustom ? (
            <li>
              <button type="button" onClick={() => commit(trimmed)}>
                {t('select.addCustom', { name: trimmed })}
              </button>
            </li>
          ) : null}
          {matches.length === 0 && !canAddCustom ? (
            <li className="searchable-select__empty">{t('select.noMatches')}</li>
          ) : (
            matches.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className={option.value === value ? 'selected' : undefined}
                  onClick={() => commit(option.value, option.label)}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </label>
  );
}
