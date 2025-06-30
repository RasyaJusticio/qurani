import { AppLocales } from '@/types/i18n';
import i18n from '../services/i18n';

export const changeLanguage = (lng: AppLocales) => {
    i18n.changeLanguage(lng).then(() => {
        localStorage.setItem('locale', lng);
    });
};