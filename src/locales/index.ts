import dayjs from 'dayjs';

import enData from './en.json';
import type {Translations} from './types';

/** PocketPal Lite ships English UI strings only. */
export type AvailableLanguage = 'en';

export const supportedLanguages: AvailableLanguage[] = ['en'];

export const languageDisplayNames: Record<AvailableLanguage, string> = {
  en: 'English (EN)',
};

export const l10n = {
  en: enData as Translations,
};

export function _testGetCacheKeys(): string[] {
  return ['en'];
}

export function t(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) =>
    String(params[key] ?? `{{${key}}}`),
  );
}

/** Lite currently supports English only, regardless of a legacy saved locale. */
export const initLocale = (_locale?: AvailableLanguage) => {
  dayjs.locale('en');
};
