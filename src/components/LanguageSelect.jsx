// src/components/LanguageSelect.jsx
// Componente profissional de seleção de idioma com bandeiras
// Usado no UserProfile → Aba Dados Pessoais → Idioma Preferido
// Ao mudar: salva no perfil + muda o idioma da app imediatamente

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Globe, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';

// ─── Lista completa de idiomas do mundo ──────────────────────────────────────
export const WORLD_LANGUAGES = [
  // Mais falados primeiro
  { code: 'zh',    name: 'Chinese',              native: '中文',             flag: '🇨🇳' },
  { code: 'es',    name: 'Spanish',              native: 'Español',          flag: '🇪🇸' },
  { code: 'en',    name: 'English',              native: 'English',          flag: '🇬🇧' },
  { code: 'hi',    name: 'Hindi',                native: 'हिन्दी',            flag: '🇮🇳' },
  { code: 'ar',    name: 'Arabic',               native: 'العربية',          flag: '🇸🇦' },
  { code: 'bn',    name: 'Bengali',              native: 'বাংলা',             flag: '🇧🇩' },
  { code: 'pt',    name: 'Portuguese',           native: 'Português',        flag: '🇵🇹' },
  { code: 'ru',    name: 'Russian',              native: 'Русский',          flag: '🇷🇺' },
  { code: 'ja',    name: 'Japanese',             native: '日本語',            flag: '🇯🇵' },
  { code: 'ko',    name: 'Korean',               native: '한국어',            flag: '🇰🇷' },
  { code: 'vi',    name: 'Vietnamese',           native: 'Tiếng Việt',       flag: '🇻🇳' },
  { code: 'tr',    name: 'Turkish',              native: 'Türkçe',           flag: '🇹🇷' },
  { code: 'de',    name: 'German',               native: 'Deutsch',          flag: '🇩🇪' },
  { code: 'fr',    name: 'French',               native: 'Français',         flag: '🇫🇷' },
  { code: 'it',    name: 'Italian',              native: 'Italiano',         flag: '🇮🇹' },
  { code: 'pl',    name: 'Polish',               native: 'Polski',           flag: '🇵🇱' },
  { code: 'uk',    name: 'Ukrainian',            native: 'Українська',       flag: '🇺🇦' },
  { code: 'nl',    name: 'Dutch',                native: 'Nederlands',       flag: '🇳🇱' },
  { code: 'ms',    name: 'Malay',                native: 'Bahasa Melayu',    flag: '🇲🇾' },
  { code: 'id',    name: 'Indonesian',           native: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'th',    name: 'Thai',                 native: 'ภาษาไทย',          flag: '🇹🇭' },
  { code: 'fa',    name: 'Persian',              native: 'فارسی',            flag: '🇮🇷' },
  { code: 'he',    name: 'Hebrew',               native: 'עברית',            flag: '🇮🇱' },
  { code: 'sv',    name: 'Swedish',              native: 'Svenska',          flag: '🇸🇪' },
  { code: 'cs',    name: 'Czech',                native: 'Čeština',          flag: '🇨🇿' },
  { code: 'ro',    name: 'Romanian',             native: 'Română',           flag: '🇷🇴' },
  { code: 'hu',    name: 'Hungarian',            native: 'Magyar',           flag: '🇭🇺' },
  { code: 'el',    name: 'Greek',                native: 'Ελληνικά',         flag: '🇬🇷' },
  { code: 'sw',    name: 'Swahili',              native: 'Kiswahili',        flag: '🇰🇪' },
  // Idiomas adicionais sem tradução completa (fallback para EN)
  { code: 'da',    name: 'Danish',               native: 'Dansk',            flag: '🇩🇰' },
  { code: 'fi',    name: 'Finnish',              native: 'Suomi',            flag: '🇫🇮' },
  { code: 'no',    name: 'Norwegian',            native: 'Norsk',            flag: '🇳🇴' },
  { code: 'sk',    name: 'Slovak',               native: 'Slovenčina',       flag: '🇸🇰' },
  { code: 'hr',    name: 'Croatian',             native: 'Hrvatski',         flag: '🇭🇷' },
  { code: 'bg',    name: 'Bulgarian',            native: 'Български',        flag: '🇧🇬' },
  { code: 'sr',    name: 'Serbian',              native: 'Srpski',           flag: '🇷🇸' },
  { code: 'lt',    name: 'Lithuanian',           native: 'Lietuvių',         flag: '🇱🇹' },
  { code: 'lv',    name: 'Latvian',              native: 'Latviešu',         flag: '🇱🇻' },
  { code: 'et',    name: 'Estonian',             native: 'Eesti',            flag: '🇪🇪' },
  { code: 'sl',    name: 'Slovenian',            native: 'Slovenščina',      flag: '🇸🇮' },
  { code: 'ca',    name: 'Catalan',              native: 'Català',           flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
  { code: 'gl',    name: 'Galician',             native: 'Galego',           flag: '🏴' },
  { code: 'eu',    name: 'Basque',               native: 'Euskara',          flag: '🏴' },
  { code: 'af',    name: 'Afrikaans',            native: 'Afrikaans',        flag: '🇿🇦' },
  { code: 'sq',    name: 'Albanian',             native: 'Shqip',            flag: '🇦🇱' },
  { code: 'hy',    name: 'Armenian',             native: 'Հայerեն',          flag: '🇦🇲' },
  { code: 'az',    name: 'Azerbaijani',          native: 'Azərbaycanca',     flag: '🇦🇿' },
  { code: 'be',    name: 'Belarusian',           native: 'Беларуская',       flag: '🇧🇾' },
  { code: 'bs',    name: 'Bosnian',              native: 'Bosanski',         flag: '🇧🇦' },
  { code: 'my',    name: 'Burmese',              native: 'မြန်မာ',            flag: '🇲🇲' },
  { code: 'km',    name: 'Khmer',                native: 'ភាសាខ្មែរ',        flag: '🇰🇭' },
  { code: 'ka',    name: 'Georgian',             native: 'ქართული',          flag: '🇬🇪' },
  { code: 'gu',    name: 'Gujarati',             native: 'ગુજરાતી',           flag: '🇮🇳' },
  { code: 'kn',    name: 'Kannada',              native: 'ಕನ್ನಡ',             flag: '🇮🇳' },
  { code: 'kk',    name: 'Kazakh',               native: 'Қазақша',          flag: '🇰🇿' },
  { code: 'lo',    name: 'Lao',                  native: 'ລາວ',              flag: '🇱🇦' },
  { code: 'mk',    name: 'Macedonian',           native: 'Македонски',       flag: '🇲🇰' },
  { code: 'ml',    name: 'Malayalam',            native: 'മലയാളം',           flag: '🇮🇳' },
  { code: 'mr',    name: 'Marathi',              native: 'मराठी',             flag: '🇮🇳' },
  { code: 'mn',    name: 'Mongolian',            native: 'Монгол',           flag: '🇲🇳' },
  { code: 'ne',    name: 'Nepali',               native: 'नेपाली',            flag: '🇳🇵' },
  { code: 'pa',    name: 'Punjabi',              native: 'ਪੰਜਾਬੀ',           flag: '🇮🇳' },
  { code: 'si',    name: 'Sinhala',              native: 'සිංහල',            flag: '🇱🇰' },
  { code: 'so',    name: 'Somali',               native: 'Soomaali',         flag: '🇸🇴' },
  { code: 'ta',    name: 'Tamil',                native: 'தமிழ்',             flag: '🇮🇳' },
  { code: 'te',    name: 'Telugu',               native: 'తెలుగు',            flag: '🇮🇳' },
  { code: 'tl',    name: 'Filipino',             native: 'Filipino',         flag: '🇵🇭' },
  { code: 'ur',    name: 'Urdu',                 native: 'اردو',             flag: '🇵🇰' },
  { code: 'uz',    name: 'Uzbek',                native: "O'zbek",           flag: '🇺🇿' },
  { code: 'cy',    name: 'Welsh',                native: 'Cymraeg',          flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'is',    name: 'Icelandic',            native: 'Íslenska',         flag: '🇮🇸' },
  { code: 'ga',    name: 'Irish',                native: 'Gaeilge',          flag: '🇮🇪' },
  { code: 'lb',    name: 'Luxembourgish',        native: 'Lëtzebuergesch',   flag: '🇱🇺' },
  { code: 'mt',    name: 'Maltese',              native: 'Malti',            flag: '🇲🇹' },
  { code: 'mk',    name: 'Macedonian',           native: 'Македонски',       flag: '🇲🇰' },
  { code: 'am',    name: 'Amharic',              native: 'አማርኛ',             flag: '🇪🇹' },
  { code: 'yo',    name: 'Yoruba',               native: 'Yorùbá',           flag: '🇳🇬' },
  { code: 'ig',    name: 'Igbo',                 native: 'Igbo',             flag: '🇳🇬' },
  { code: 'ha',    name: 'Hausa',                native: 'Hausa',            flag: '🇳🇬' },
  { code: 'zu',    name: 'Zulu',                 native: 'IsiZulu',          flag: '🇿🇦' },
  { code: 'xh',    name: 'Xhosa',                native: 'IsiXhosa',         flag: '🇿🇦' },
  { code: 'ht',    name: 'Haitian Creole',       native: 'Kreyòl ayisyen',   flag: '🇭🇹' },
  { code: 'la',    name: 'Latin',                native: 'Latina',           flag: '🇻🇦' },
];

// Idiomas que têm tradução completa na app
const SUPPORTED_CODES = new Set(['pt','en','es','fr','de','it','ru','zh','ja','ko','ar','hi','tr','pl','nl','sv','id','vi','th','uk','cs','ro','hu','el','he','fa','bn','sw','ms']);

// ─── Componente ───────────────────────────────────────────────────────────────
const LanguageSelect = ({ value, onChange, compact = false }) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Idioma actualmente seleccionado
  const current = WORLD_LANGUAGES.find(l => l.code === value) || WORLD_LANGUAGES.find(l => l.code === 'pt');

  // Filtrar por pesquisa
  const filtered = useMemo(() => {
    if (!query) return WORLD_LANGUAGES;
    const q = query.toLowerCase();
    return WORLD_LANGUAGES.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.native.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (lang) => {
    onChange(lang.code);
    // Mudar idioma da app imediatamente (só se tiver tradução)
    const targetLng = SUPPORTED_CODES.has(lang.code) ? lang.code : 'en';
    i18n.changeLanguage(targetLng);
    localStorage.setItem('bomPiteuLanguage', lang.code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="space-y-2">
      <Label className="text-gray-700 dark:text-gray-300 font-medium">
        {t('profile.fields.language', 'Idioma Preferido')}
      </Label>

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 text-left transition-colors hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 ${compact ? 'h-9' : 'h-11'}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg leading-none shrink-0">{current?.flag}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {current?.native}
            </span>
            {SUPPORTED_CODES.has(current?.code) && (
              <span className="hidden sm:inline text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                ✓ {t('languageSelect.translatedBadge')}
              </span>
            )}
          </div>
          <Globe className="h-4 w-4 text-gray-400 shrink-0" />
        </button>

        {/* Dropdown */}
        {open && (
          <>
            {/* Overlay para fechar */}
            <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setQuery(''); }} />

            <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
              {/* Barra de pesquisa */}
              <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t('languageSelect.searchPlaceholder')}
                    className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none"
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Lista com scroll */}
              <div className="max-h-64 overflow-y-auto overscroll-contain">
                {/* Idiomas com tradução completa */}
                {!query && (
                  <div className="px-3 py-1.5 text-[10px] font-bold text-orange-500 uppercase tracking-wider bg-orange-50 dark:bg-orange-900/10">
                    ✓ {t('languageSelect.supportedSection')}
                  </div>
                )}
                {filtered
                  .filter(l => query || SUPPORTED_CODES.has(l.code))
                  .map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelect(lang)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="text-lg leading-none shrink-0">{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                          {lang.native}
                        </span>
                        <span className="block text-[11px] text-gray-400 dark:text-gray-500">
                          {lang.name}
                        </span>
                      </div>
                      {value === lang.code && (
                        <Check className="h-4 w-4 text-orange-500 shrink-0" />
                      )}
                    </button>
                  ))
                }

                {/* Todos os outros idiomas */}
                {!query && (
                  <>
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/80">
                      {t('languageSelect.allLanguagesSection')}
                    </div>
                    {WORLD_LANGUAGES
                      .filter(l => !SUPPORTED_CODES.has(l.code))
                      .map(lang => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => handleSelect(lang)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <span className="text-lg leading-none shrink-0">{lang.flag}</span>
                          <div className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                              {lang.native}
                            </span>
                            <span className="block text-[11px] text-gray-400 dark:text-gray-500">
                              {lang.name}
                            </span>
                          </div>
                          {value === lang.code && (
                            <Check className="h-4 w-4 text-orange-500 shrink-0" />
                          )}
                        </button>
                      ))
                    }
                  </>
                )}

                {query && filtered.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-400">
                    {t('languageSelect.noResults')}
                  </div>
                )}
              </div>

              <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 text-[11px] text-gray-400 text-center">
                {t('languageSelect.languagesCount', { count: WORLD_LANGUAGES.length })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LanguageSelect;