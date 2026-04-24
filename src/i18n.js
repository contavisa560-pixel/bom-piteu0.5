// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


// ── Traduções ──────────────────────────────────────────────────────────────
import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import tr from './locales/tr.json';
import pl from './locales/pl.json';
import nl from './locales/nl.json';
import sv from './locales/sv.json';
import id from './locales/id.json';
import vi from './locales/vi.json';
import th from './locales/th.json';
import uk from './locales/uk.json';
import cs from './locales/cs.json';
import ro from './locales/ro.json';
import hu from './locales/hu.json';
import el from './locales/el.json';
import he from './locales/he.json';
import fa from './locales/fa.json';
import bn from './locales/bn.json';
import sw from './locales/sw.json';
import ms from './locales/ms.json';

i18n
 
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      ru: { translation: ru },
      zh: { translation: zh },
      ja: { translation: ja },
      ko: { translation: ko },
      ar: { translation: ar },
      hi: { translation: hi },
      tr: { translation: tr },
      pl: { translation: pl },
      nl: { translation: nl },
      sv: { translation: sv },
      id: { translation: id },
      vi: { translation: vi },
      th: { translation: th },
      uk: { translation: uk },
      cs: { translation: cs },
      ro: { translation: ro },
      hu: { translation: hu },
      el: { translation: el },
      he: { translation: he },
      fa: { translation: fa },
      bn: { translation: bn },
      sw: { translation: sw },
      ms: { translation: ms },
    },
    lng: localStorage.getItem('bomPiteuLanguage') || 'pt',
    fallbackLng: 'pt',
    interpolation: { escapeValue: false },
  
  });

export default i18n;