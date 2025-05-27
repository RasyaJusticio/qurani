export const getLocaleFromLanguageCode = (languageCode: string | null): string => {
    const languageMap: { [key: string]: string } = {
        id_id: "id_id",
        en_us: "en_us",
        ra_ra: "ra_ra",
    };
    return languageMap[languageCode || ""] || "id_id";
};

