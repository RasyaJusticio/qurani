import { ARABIC_NUMERALS } from "../constants/arabicNumerals";

export const toArabicNumerals = (num: number | string): string => {
  return num.toString().replace(/[0-9]/g, (digit) => ARABIC_NUMERALS[parseInt(digit)]);
};

