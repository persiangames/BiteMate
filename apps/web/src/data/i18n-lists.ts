export const UI_LANGS = ['en', 'fa', 'ar', 'zh', 'fr', 'de', 'hi', 'it', 'ja', 'ru', 'es', 'tr'] as const;
export type UiLang = (typeof UI_LANGS)[number];

export type LabelRow = readonly [
  string, string, string, string, string, string,
  string, string, string, string, string, string,
];

export function pickRow(row: LabelRow | undefined, locale: string, fallback: string): string {
  if (!row) {
    return fallback;
  }
  const index = UI_LANGS.indexOf(locale as UiLang);
  return row[index >= 0 ? index : 0] || row[0] || fallback;
}

/** Fill every language; omitted locales keep the English name. */
export function L(
  en: string,
  extra?: Partial<Record<Exclude<UiLang, 'en'>, string>>,
): LabelRow {
  return [
    en,
    extra?.fa ?? en,
    extra?.ar ?? en,
    extra?.zh ?? en,
    extra?.fr ?? en,
    extra?.de ?? en,
    extra?.hi ?? en,
    extra?.it ?? en,
    extra?.ja ?? en,
    extra?.ru ?? en,
    extra?.es ?? en,
    extra?.tr ?? en,
  ];
}

export type SelectOption = { value: string; label: string };

export function sortOptions(options: SelectOption[], locale: string): SelectOption[] {
  return [...options].sort((a, b) => a.label.localeCompare(b.label, locale, { sensitivity: 'base' }));
}
