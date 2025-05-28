import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocaleFromLanguageCode } from './utils/getLocaleFromLanguageCode';

const initializeI18n = async () => {
    const languageCode = localStorage.getItem("language_code") ?? "id_id";

    await i18n
        .use(initReactI18next)
        .init({
            lng: getLocaleFromLanguageCode(languageCode),
            fallbackLng: 'id_id',
            interpolation: {
                escapeValue: false,
            },
            initImmediate: false
        });
};

export const loadTranslationFile = async (namespace: string) => {
    const languageCode = localStorage.getItem("language_code") ?? "id_id";
    const locale = languageCode;

    try {
        const response = await fetch(`/assets/translations/${locale}/${namespace}.json`);
        if (!response.ok) {
            const fallbackResponse = await fetch(`/assets/translations/id_id/${namespace}.json`);
            if (!fallbackResponse.ok) throw new Error('Translation not found');
            return await fallbackResponse.json();
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${namespace} translations:`, error);
        return {};
    }
};

export const setupTranslations = async (namespace: string) => {
    const languageCode = localStorage.getItem("language_code") ?? "id_id";

    const translations = await loadTranslationFile(namespace);
    i18n.addResourceBundle(
        getLocaleFromLanguageCode(languageCode),
        namespace,
        translations,
        true,
        true
    );
};

initializeI18n();

export { i18n };
