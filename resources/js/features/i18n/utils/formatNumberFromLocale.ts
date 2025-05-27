import { toArabicNumerals } from "./toArabicNumerals";

export const formatNumberFromLocale = (num: number | string): string => {
  const languageCode = localStorage.getItem("language_code");
  if (languageCode === 'ra_ra') {
    return toArabicNumerals(num);
  }
  return num.toString();
};

