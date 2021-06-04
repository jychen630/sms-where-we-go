import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translations from "./translations.json";

i18n
    .use(initReactI18next)
    .init({
        resources: translations as any,
        lng: "zh-CN",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
