import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import pt from "./locales/pt.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "pt",
  fallbackLng: "pt",
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    es: { translation: es }
  }
});

export default i18n;
