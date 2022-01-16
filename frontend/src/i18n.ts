import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translations from "./translations.json";

const options = {
    order: ['querystring', 'navigator'],
    lookupQuerystring: 'lng'
};

i18n.use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources: translations as any,
        detection: options,
        supportedLngs: ["zh-CN", "en"],
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
