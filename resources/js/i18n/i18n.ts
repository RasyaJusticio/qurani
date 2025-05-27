import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const toArabicNumerals = (num: number | string): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
};

const getLocaleFromLanguageCode = (languageCode: string | null): string => {
    const languageMap: { [key: string]: string } = {
        id_id: "id_id",
        en_us: "en_us",
        ra_ra: "ra_ra",
    };
    return languageMap[languageCode || ""] || "id_id";
};

const loadTranslationFile = async (namespace: string) => {
    const languageCode = localStorage.getItem("language_code");
    const locale = getLocaleFromLanguageCode(languageCode);

    try {
        const response = await fetch(`/assets/translations/${locale}/${namespace}.json`);
        if (!response.ok) {
            const fallbackResponse = await fetch(`/assets/translations/en_us/${namespace}.json`);
            if (!fallbackResponse.ok) throw new Error('Translation not found');
            return await fallbackResponse.json();
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${namespace} translations:`, error);
        return {};
    }
};

const initializeI18n = async () => {
    await i18n
        .use(initReactI18next)
        .init({
            lng: getLocaleFromLanguageCode(localStorage.getItem("language_code")),
            fallbackLng: 'en_us',
            interpolation: {
                escapeValue: false,
            },
            initImmediate: false
        });
};

initializeI18n();

export const addTranslations = async (namespace: string) => {
    const translations = await loadTranslationFile(namespace);
    i18n.addResourceBundle(
        getLocaleFromLanguageCode(localStorage.getItem("language_code")),
        namespace,
        translations,
        true,
        true
    );
};

export default i18n;
