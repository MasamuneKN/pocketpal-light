import dayjs from 'dayjs';

import {
  l10n,
  t,
  supportedLanguages,
  languageDisplayNames,
  _testGetCacheKeys,
  initLocale,
} from '../index';
import enData from '../en.json';
import type {AvailableLanguage} from '../index';

describe('English-only locale bundle', () => {
  it('exposes English as the only supported language', () => {
    expect(supportedLanguages).toEqual(['en']);
    expect(Object.keys(l10n)).toEqual(['en']);
    expect(languageDisplayNames).toEqual({'en': 'English (EN)'});
  });

  it('uses the bundled English translations without copying them', () => {
    expect(l10n.en).toBe(enData);
    expect(_testGetCacheKeys()).toEqual(['en']);
  });

  it('keeps the AvailableLanguage type aligned with the supported locale', () => {
    const language: AvailableLanguage = 'en';
    expect(supportedLanguages).toContain(language);
  });

  it('returns undefined for unsupported locale keys', () => {
    expect((l10n as any).ar).toBeUndefined();
    expect((l10n as any).fr).toBeUndefined();
  });
});

describe('t() interpolation helper', () => {
  it('replaces single and multiple placeholders', () => {
    expect(t('Hello {{name}}', {name: 'World'})).toBe('Hello World');
    expect(t('{{count}} items cost {{price}}', {count: 2, price: 4.5})).toBe(
      '2 items cost 4.5',
    );
  });

  it('preserves missing placeholders and handles zero', () => {
    expect(t('{{name}} has {{count}}', {count: 0})).toBe(
      '{{name}} has 0',
    );
  });
});

describe('initLocale', () => {
  afterEach(() => dayjs.locale('en'));

  it('always initializes Day.js with English', () => {
    initLocale('en');
    expect(dayjs.locale()).toBe('en');
  });
});
