import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

let subpath = '';
if (process.env.NODE_ENV !== 'development') {
    subpath = 'portal/';
}
console.log(process.env.NODE_ENV);

i18n
    // load translation using xhr -> see /public/locales
    // learn more: https://github.com/i18next/i18next-xhr-backend
    .use(Backend)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        fallbackLng: 'en',
        debug: true,
        loadPath: '/locales/' + subpath + '{{lng}}/{{ns}}.json',
        addPath: subpath + 'locales/add/{{lng}}/{{ns}}',

        interpolation: {
            escapeValue: false // not needed for react as it escapes by default
        }
    });

export default i18n;
