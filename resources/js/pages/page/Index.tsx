import AppWrapper from '@/components/layouts/app-wrapper';
import QuranHeader from '@/components/layouts/main-header';
import { cn } from '@/lib/utils';
import { Head, usePage } from '@inertiajs/react';
import React, { JSX, useEffect, useState } from 'react';
import MistakeModal from '../../components/layouts/mistakeModal';
import { useTranslation } from 'react-i18next';

interface Word {
    id: number;
    position: number;
    location: string;
    text_uthmani: string;
    char_type_name: string;
    line_number: number;
}

interface WordIndopak {
    [key: string]: {
        id: number;
        surah: number;
        ayah: string;
        word: string;
        location: string
        text: string
    }
}

interface Verse {
    id: number;
    verse_number: number;
    verse_key: string;
    text_uthmani: string;
    page_number: number;
    juz_number: number;
    end_marker: string;
    words: Word[];
}

interface Chapter {
    id: number;
    name_arabic: string;
    name_simple: string;
    translated_name: { name: string; language_name: string };
    bismillah_pre: boolean | null;
}

interface Page {
    page_number: number;
}

interface ErrorLabel {
    id: number;
    key: string;
    value: string;
    color: string;
    status: number;
}

interface PageProps {
    page: Page;
    verses: Verse[];
    errorLabels: ErrorLabel[];
    setting?: boolean; // Optional setting property to handle user/group settings
    chapters: { [key: number]: Chapter };
    [key: string]: unknown;
}

interface ErrorsByPage {
    [page: string]: {
        salahAyat: Array<{
            salahKey: string;
            NamaSurat: string;
            noAyat: number;
            salah: string;
        }>;
        salahKata: Array<{
            salahKey: string;
            kata: { text: string };
            word_location: string;
            salah: string;
        }>;
    };
}


export default function PageIndex() {
    const { page, verses, chapters, errorLabels, setting } = usePage<PageProps>().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
    const [selectedVerseId, setSelectedVerseId] = useState<number | null>(null);
    const [wordErrors, setWordErrors] = useState<{ [key: number]: string }>({});
    const [verseErrors, setVerseErrors] = useState<{ [key: number]: string }>({});
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [currentErrorLabels, setCurrentErrorLabels] = useState<ErrorLabel[] | null>(null);
    const [wordIndopak, setWordIndopak] = useState<WordIndopak | null>(null)
    const [wordUtsmani, setWordUtsmani] = useState<WordIndopak | null>(null)
    const { t } = useTranslation("surah")

    useEffect(() => {
        async function fetchDataIndopak() {
            try {
                // Path relatif ke file JSON Anda di folder public
                const response = await fetch('/assets/json/indopak-nastaleeq.json')

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setWordIndopak(data);
            } catch (e) {
                console.log(e)
            }
        }
        async function fetchDataUtsmani() {
            try {
                // Path relatif ke file JSON Anda di folder public
                const response = await fetch('/assets/json/qpc-utsmani.json');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setWordUtsmani(data);
            } catch (e) {
                console.log(e)
            }
        }

        fetchDataIndopak();
        fetchDataUtsmani();
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (verses.length === 0) {
            setModalOpen(true);
            return;
        }

        const versesBySurah: { [key: number]: Verse[] } = {};
        verses.forEach((verse) => {
            const surahId = parseInt(verse.verse_key.split(':')[0]);
            if (!versesBySurah[surahId]) {
                versesBySurah[surahId] = [];
            }
            versesBySurah[surahId].push(verse);
        });

        const surahIds = Object.keys(versesBySurah)
            .map((id) => parseInt(id))
            .sort((a, b) => a - b);
        const firstSurahId = surahIds[0];
        const lastSurahId = surahIds[surahIds.length - 1];

        const surahDetails = surahIds.map((id) => ({
            id: id.toString(),
            name: chapters[id].name_simple,
            first_verse: versesBySurah[id][0].verse_number.toString(),
            last_verse: versesBySurah[id][versesBySurah[id].length - 1].verse_number.toString(),
        }));

        const existingData = localStorage.getItem('setoran-data');
        const parsedData = existingData ? JSON.parse(existingData) : { recipient: '', reciter: { user_name: '', full_name: '' } };
        const dataToSave = {
            ...parsedData,
            setoran_type: parsedData.setoran_type || 'tahsin',
            display: 'page',
            surah: {
                name: `Page ${page.page_number}`,
                first_surah: firstSurahId.toString(),
                last_surah: lastSurahId.toString(),
                surah: surahDetails,
            },
            mistake: parsedData.mistake || {},
        };
        const savedWordErrors = localStorage.getItem('wordErrors');
        const savedVerseErrors = localStorage.getItem('verseErrors');
        if (savedWordErrors) setWordErrors(JSON.parse(savedWordErrors));
        if (savedVerseErrors) setVerseErrors(JSON.parse(savedVerseErrors));

        localStorage.setItem('setoran-data', JSON.stringify(dataToSave));
    }, [verses, chapters, page]);

    useEffect(() => {
        const errorsByPage = generateErrorsByPage();
        const existingData = localStorage.getItem('setoran-data');
        const parsedData = existingData ? JSON.parse(existingData) : { recipient: '', reciter: { user_name: '', full_name: '' } };
        const dataToSave = {
            ...parsedData,
            setoran_type: parsedData.setoran_type || 'tahsin',
            display: 'page',
            page_number: page.page_number,
            surah: {
                ...parsedData.surah,
                id: `page-${page.page_number}`,
                name: `Page ${page.page_number}`,
            },
            mistake: errorsByPage,
        };
        localStorage.setItem('setoran-data', JSON.stringify(dataToSave));
    }, [wordErrors, verseErrors, page, currentErrorLabels]);

    useEffect(() => {
        localStorage.setItem('wordErrors', JSON.stringify(wordErrors));
        localStorage.setItem('verseErrors', JSON.stringify(verseErrors));
    }, [wordErrors, verseErrors]);

    const handleClick = (type: 'word' | 'verse', id: number) => {
        if (type === 'word') {
            setSelectedWordId(id);
            setSelectedVerseId(null);
        } else {
            setSelectedVerseId(id);
            setSelectedWordId(null);
        }
        setModalOpen(true);
    };

    const handleLabelSelect = (key: string) => {
        if (selectedWordId !== null) {
            setWordErrors((prev) => ({ ...prev, [selectedWordId]: key }));
        } else if (selectedVerseId !== null) {
            setVerseErrors((prev) => ({ ...prev, [selectedVerseId]: key }));
        }
        setModalOpen(false);
        setSelectedWordId(null);
        setSelectedVerseId(null);
    };

    const handleRemoveLabel = () => {
        if (selectedWordId !== null) {
            setWordErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[selectedWordId];
                return newErrors;
            });
        } else if (selectedVerseId !== null) {
            setVerseErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[selectedVerseId];
                return newErrors;
            });
        }
        setModalOpen(false);
        setSelectedWordId(null);
        setSelectedVerseId(null);
    };

    const generateErrorsByPage = (): ErrorsByPage => {
        const errorsByPage: ErrorsByPage = {};
        Object.keys(verseErrors).forEach((verseIdStr) => {
            const verseId = Number(verseIdStr);
            const verse = verses.find((v) => v.id === verseId);
            if (verse) {
                const page = verse.page_number.toString();
                if (!errorsByPage[page]) {
                    errorsByPage[page] = { salahAyat: [], salahKata: [] };
                }
                const errorKey = verseErrors[verseId];
                const errorLabel = validateErrorLabels().find((label) => label.key === errorKey);
                if (errorLabel) {
                    const surahId = parseInt(verse.verse_key.split(':')[0]);
                    const surahName = chapters[surahId].name_simple;
                    errorsByPage[page].salahAyat.push({
                        salahKey: errorKey,
                        NamaSurat: surahName,
                        noAyat: verse.verse_number,
                        salah: errorLabel.value,
                    });
                }
            }
        });

        Object.keys(wordErrors).forEach((wordIdStr) => {
            const wordId = Number(wordIdStr);
            const verse = verses.find((v) => v.words.some((w) => w.id === wordId));
            if (verse) {
                const page = verse.page_number.toString();
                if (!errorsByPage[page]) {
                    errorsByPage[page] = { salahAyat: [], salahKata: [] };
                }
                const word = verse.words.find((w) => w.id === wordId);
                if (word) {
                    const errorKey = wordErrors[wordId];
                    // Perbaikan di sini: errorLabels.find ini mencari di seluruh label yang tersedia
                    // const allErrorLabels = [...(errorLabels.teman || []), ...(errorLabels.grup[`${selectedGrup}`] || [])];
                    // const errorLabel = allErrorLabels.find((label) => label.key === errorKey);
                    const errorLabel = validateErrorLabels().find((label) => label.key === errorKey);
                    if (errorLabel) {
                        errorsByPage[page].salahKata.push({
                            salahKey: errorKey,
                            kata: { text: word.text_uthmani },
                            word_location: word.location,
                            salah: errorLabel.value,
                        });
                    }
                }
            }
        });
        return errorsByPage;
    };

    const versesBySurah: { [surahId: number]: Verse[] } = {};
    verses.forEach((verse) => {
        const surahId = parseInt(verse.verse_key.split(':')[0]);
        if (!versesBySurah[surahId]) {
            versesBySurah[surahId] = [];
        }
        versesBySurah[surahId].push(verse);
    });

    const validateErrorLabels = (): ErrorLabel[] => {
        if (currentErrorLabels) {
            return currentErrorLabels
        } else {
            return errorLabels
        }
    }

    function fontType() {
        let fontType;
        if (!validateErrorLabels()) return;
        validateErrorLabels().map((v) => {
            if (v.key == "font") {
                fontType = v.value;
            }
        })

        return fontType
    }

    function getFontSizeClass(realSize: boolean = false): string | number {
        const kaliFont = isMobile ? 5 : 6;
        let finalCalculatedPx = isMobile ? 0 : 30;
        let finalRealSize: number = 16;

        const labels = validateErrorLabels();

        if (labels) {
            const fontSizeLabel = labels.find((v) => v.key === "font-size");

            if (fontSizeLabel && fontSizeLabel.value) {
                const parsedValue = parseInt(fontSizeLabel.value, 10);

                if (!isNaN(parsedValue)) {
                    finalRealSize = parsedValue;
                    finalCalculatedPx = parsedValue * kaliFont;
                }
            }
        }

        if (realSize) {
            return finalRealSize;
        } else {
            return `${finalCalculatedPx}px`;
        }
    }

    function getFont(location: string): string {
        if (fontType() == "IndoPak") {
            if (!wordIndopak || !wordIndopak[`${location}`]) {
                return '';
            }
            return wordIndopak[`${location}`]?.text || '';

        } else {
            if (!wordUtsmani || !wordUtsmani[`${location}`]) {
                return '';
            }
            return wordUtsmani[`${location}`]?.text || '';
        }
    }

    function loadFontFace(page: number): string {
        const fontName = `QPCPage${page}`;
        const fontUrl = `/assets/fonts/QPC V1 Font/p${page}.woff2`;

        // Buat elemen style untuk inject font-face
        const style = document.createElement('style');
        style.innerHTML = `
            @font-face {
                font-family: '${fontName}';
                src: url('${fontUrl}') format('woff2');
                font-display: swap;
            }

            .${fontName} {
                font-family : ${fontName}
            }
        `;
        document.head.appendChild(style);

        return fontName
    }

    const classUtsmani = loadFontFace(page.page_number)

    function renderFleksibel(): JSX.Element {
        return (
            <>
                {Object.keys(versesBySurah).map((surahId) => {
                    const surah = chapters[parseInt(surahId)];
                    const verse: Verse = versesBySurah[parseInt(surahId)][0];
                    const header: boolean = verse.verse_number === 1
                    return (
                        <div key={surahId}>
                            {/* Surah Header - hanya ditampilkan sekali di awal surah */}
                            {
                                header && (
                                    <div className="mb-6 text-center">
                                        <h2 className={`${fontType() == "IndoPak" ? "font-arabic-indopak" : "font-arabic"} text-3xl font-bold dark:text-gray-300`}>
                                            {surah.name_arabic}
                                        </h2>
                                        <p className={`mt-2 text-lg text-gray-600 dark:text-gray-300`}>
                                            {surah.name_simple} ({t(`surah.${surahId}`)})
                                        </p>
                                        {surah.bismillah_pre && (
                                            <p className={`${fontType() == "IndoPak" ? "font-arabic-indopak" : "qpc"} mt-4 text-3xl text-black dark:text-gray-300`}>
                                                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                                            </p>
                                        )}
                                    </div>
                                )
                            }

                            {/* Ayat-ayat dalam surah */}
                            <div style={{ direction: 'rtl' }}>
                                {versesBySurah[parseInt(surahId)].map((verse) => {
                                    const verseLabel = verseErrors[verse.id]
                                        ? validateErrorLabels().find((l) => l.key === verseErrors[verse.id])
                                        : null;

                                    return (
                                        <span key={verse.id}>
                                            <span
                                                className='transition-colors duration-200'
                                                style={{
                                                    fontSize: getFontSizeClass(),
                                                    backgroundColor: verseLabel?.color || 'transparent',
                                                    padding: fontType() == "IndoPak" ? '5px 3px' : '5px 6px',
                                                    lineHeight: fontType() == "IndoPak" ? '170%' : '170%',
                                                    borderRadius: verseLabel ? '6px' : '0',
                                                    marginRight: verseLabel ? '4px' : '0',
                                                    verticalAlign: 'middle',
                                                }}
                                                onClick={() => handleClick('verse', verse.id)}
                                            >
                                                {verse.words.map((word) => {
                                                    const allAvailableLabels = validateErrorLabels();
                                                    const wordLabel = wordErrors[word.id]
                                                        ? allAvailableLabels.find((l) => l.key === wordErrors[word.id])
                                                        : null;
                                                    const wordLabels = wordLabel
                                                    return (
                                                        <span
                                                            key={word.id}
                                                            className={cn(
                                                                `cursor-pointer text-gray-700 transition-colors duration-200 hover:text-blue-300 dark:hover:text-blue-300`,
                                                                wordLabels || verseLabel ? 'dark:text-gray-900' : 'dark:text-gray-300',
                                                            )}
                                                            style={{
                                                                fontSize: getFontSizeClass(),
                                                                backgroundColor: wordLabels?.color || 'transparent',
                                                                display: 'inline-block',
                                                                borderRadius: wordLabels ? '6px' : '0',
                                                                margin: wordLabels ? '0 1px' : '0',
                                                                padding: wordLabels ? "0px 3px" : "0px 5px",
                                                                textAlign: "center",
                                                                lineHeight: "1.1",
                                                                verticalAlign: 'middle',
                                                            }}
                                                        >
                                                            {
                                                                word.char_type_name == "word" && (
                                                                    <span
                                                                        className={fontType() == "IndoPak" ? "font-arabic-indopak" : `${classUtsmani}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleClick('word', word.id);
                                                                        }}
                                                                    >
                                                                        {getFont(word.location)}
                                                                    </span>
                                                                )
                                                            }
                                                            {
                                                                word.char_type_name == "end" && (
                                                                    <span
                                                                        onClick={() => handleClick('verse', verse?.id || 1)}
                                                                    >
                                                                        {fontType() == "IndoPak" ? (
                                                                            <span className="font-arabic-indopak">
                                                                                {getFont(word.location)}
                                                                            </span>
                                                                        ) : (
                                                                            <span className={`${classUtsmani}`}>
                                                                                {/* ۝{word.text_uthmani} */}
                                                                                {getFont(word.location)}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                )
                                                            }
                                                        </span>
                                                    );
                                                })}
                                            </span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </>
        );
    }
    function renderMushaf(): JSX.Element {
        const wordsByLine: { [lineNumber: number]: { verse: Verse, word: Word }[] } = {};
        verses.forEach(verse => {
            verse.words.forEach(word => {
                if (word.line_number !== undefined) {
                    if (!wordsByLine[word.line_number]) {
                        wordsByLine[word.line_number] = [];
                    }
                    wordsByLine[word.line_number].push({ verse, word });
                }
            });
        });
        const validationPage = page.page_number === 1 || page.page_number === 2;
        const surahHeaders: { [lineNumber: number]: JSX.Element } = {};
        const displayedSurahs = new Set<number>();

        // Pre-process to find where surah headers should appear
        verses.forEach(verse => {
            const surahId = parseInt(verse.verse_key.split(':')[0]);
            if (!displayedSurahs.has(surahId)) {
                displayedSurahs.add(surahId);

                // Find the first line of this surah
                const firstWord = verse.words.find(w => w.line_number !== undefined);
                if (firstWord && verse.verse_number === 1) {
                    console.log(firstWord)
                    surahHeaders[firstWord.line_number] = (
                        <div key={`surah-${surahId}`} style={{
                            textAlign: 'center',
                        }}>
                            <div>
                                <h2 style={{
                                    fontFamily: fontType() === "IndoPak" ? "'IndoPak', 'Traditional Arabic'" : "'Uthmani', 'Traditional Arabic'",
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    marginBottom: '5px'
                                }}>
                                    {chapters[surahId].name_arabic}
                                </h2>
                                <p style={{
                                    fontSize: '16px',
                                    color: '#555',
                                    marginBottom: '10px'
                                }}>
                                    {chapters[surahId].name_simple} ({t(`surah.${surahId}`)})
                                </p>
                                {chapters[surahId].bismillah_pre && (
                                    <p style={{
                                        fontFamily: fontType() === "IndoPak" ? "'IndoPak', 'Traditional Arabic'" : "'Uthmani', 'Traditional Arabic'",
                                        fontSize: '24px',
                                        margin: '15px 0'
                                    }}>
                                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                }
            }
        });

        return (
            <div style={{ maxWidth: "fit-content", margin: '0 auto' }}>
                {Object.keys(wordsByLine).length > 0 ? (
                    <div key={page.page_number} style={{ margin: '0 auto' }}>
                        {Object.entries(wordsByLine).map(([lineNumberStr, lineWords]) => {
                            const lineNumber = parseInt(lineNumberStr);
                            const wordsByVerse: { [verseId: number]: Word[] } = {};
                            lineWords.forEach(({ verse, word }) => {
                                if (!wordsByVerse[verse.id]) {
                                    wordsByVerse[verse.id] = [];
                                }
                                wordsByVerse[verse.id].push(word);
                            });

                            return (
                                <React.Fragment key={lineNumber}>
                                    {/* Render surah header if exists for this line */}
                                    {surahHeaders[lineNumber] && surahHeaders[lineNumber]}

                                    {/* Render the line content */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: validationPage ? 'center' : 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '5px',
                                            width: '100%',
                                            direction: 'rtl',
                                            textAlign: validationPage ? 'center' : 'justify'
                                        }}
                                    >
                                        {Object.entries(wordsByVerse).map(([verseIdStr, words]) => {
                                            const verseId = parseInt(verseIdStr);
                                            const verse = verses.find(v => v.id === verseId);
                                            const verseLabel = verseErrors[verseId]
                                                ? validateErrorLabels().find((l) => l.key === verseErrors[verseId])
                                                : null;

                                            const totalWordsInVerse = words.length;

                                            return (
                                                <div
                                                    key={verseId}
                                                    style={{
                                                        backgroundColor: verseLabel?.color || 'transparent',
                                                        borderRadius: verseLabel ? '6px' : '0',
                                                        padding: verseLabel ? "0px 1px" : "0",
                                                        margin: '0 1px',
                                                        display: 'flex',
                                                        justifyContent: validationPage ? 'center' :
                                                            (totalWordsInVerse <= 2 ? 'flex-start' : 'space-between'),
                                                        alignItems: 'center',
                                                        flex: validationPage ? 'none' :
                                                            (totalWordsInVerse <= 2 ? '0 1 auto' : '1 1 auto'),
                                                        minWidth: 'fit-content',
                                                        gap: totalWordsInVerse <= 2 ? '4px' : '0px',
                                                    }}
                                                >
                                                    {words.map((word) => {
                                                        const wordLabel = wordErrors[word.id]
                                                            ? validateErrorLabels().find((l) => l.key === wordErrors[word.id])
                                                            : null;

                                                        const showWordHighlight = wordLabel || verseLabel;

                                                        return (
                                                            <span
                                                                key={word.id}
                                                                style={{
                                                                    fontSize: getFontSizeClass(),
                                                                    backgroundColor: showWordHighlight ? wordLabel?.color : 'transparent',
                                                                    borderRadius: showWordHighlight ? '4px' : '0',
                                                                    margin: '0 1px',
                                                                    padding: showWordHighlight ? "1px 2px" : "0 0px",
                                                                    display: 'inline-block',
                                                                    lineHeight: '1.1',
                                                                    textAlign: 'center',
                                                                    flex: validationPage ? 'none' :
                                                                        (totalWordsInVerse <= 2 ? '0 0 auto' : '0 0 auto'),
                                                                    minWidth: 'min-content'
                                                                }}
                                                                className={cn(
                                                                    `
                                                            cursor-pointer text-gray-700 transition-colors duration-200
                                                        hover:text-blue-300 dark:hover:text-blue-300`,
                                                                    showWordHighlight ? 'dark:text-gray-900' : 'dark:text-gray-300',
                                                                )}
                                                            >
                                                                {
                                                                    word.char_type_name == "word" && (
                                                                        <span
                                                                            className={fontType() == "IndoPak" ? "font-arabic-indopak" : `${classUtsmani}`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleClick('word', word.id);
                                                                            }}
                                                                        >
                                                                            {getFont(word.location)}
                                                                        </span>
                                                                    )
                                                                }
                                                                {
                                                                    word.char_type_name == "end" && (
                                                                        <span
                                                                            onClick={() => handleClick('verse', verse?.id || 1)}
                                                                        >
                                                                            {fontType() == "IndoPak" ? (
                                                                                <span className="font-arabic-indopak">
                                                                                    {getFont(word.location)}
                                                                                </span>
                                                                            ) : (
                                                                                <span className={`${classUtsmani}`}>
                                                                                    {getFont(word.location)}
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    )
                                                                }
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </React.Fragment>
                            );
                        })}

                        {/* Page separator */}
                        <div className="my-4 flex items-center">
                            <hr className={`flex-1 border-2 border-t border-gray-300`} />
                            <span className={`mx-4 text-sm font-bold text-gray-700 dark:text-white`}>
                                Page {page.page_number}
                            </span>
                            <hr className={`flex-1 border-2 border-t border-gray-300`} />
                        </div>
                    </div>
                ) : (
                    <div className={`text-gray-700`}>Tidak ada data ayat untuk ditampilkan.</div>
                )}
            </div>
        );
    }

    function getTataLetakClass(): JSX.Element {
        const labels = validateErrorLabels();
        const tataletakValue = labels?.find((v) => v.key === "tata-letak")?.value;

        if (isMobile) {
            const fontSize = getFontSizeClass(true);
            if (typeof fontSize === "number" && fontSize >= 5) {
                return renderFleksibel();
            }
            if (typeof fontSize === "number" && fontSize < 5) {
                return renderMushaf();
            }
        }

        // Logika di luar blok `isMobile`
        if (tataletakValue === "fleksibel") {
            return renderFleksibel();
        }

        return renderMushaf();
    }

    return (
        <AppWrapper>
            <Head title={`Page ${page.page_number} - Recap`} />
            <QuranHeader page={1} translateMode="read" target={`/result/page/${page.page_number}`} errorLabels={validateErrorLabels()} onUpdateErrorLabels={setCurrentErrorLabels} setting={setting} />
            <div className="mx-auto overflow-auto p-4">
                <MistakeModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedWordId(null);
                        setSelectedVerseId(null);
                    }}
                    onLabelSelect={handleLabelSelect}
                    onRemoveLabel={handleRemoveLabel}
                    errorLabels={validateErrorLabels()}
                    versesEmpty={verses.length === 0}
                    selectedWordId={selectedWordId}
                    selectedVerseId={selectedVerseId}
                    wordErrors={wordErrors}
                    verseErrors={verseErrors}
                />
                <div className="mt-20 mb-7 text-center">
                    <p className={`text-lg dark:text-gray-300`}>Page {page.page_number}</p>
                </div>
                <div
                    className={`dark:text-gray-300 pb-[100px] md:pb-0`}
                    style={{
                        direction: 'rtl',
                        textAlign: 'justify',
                        textJustify: 'inter-word',
                        lineHeight: '1.5',
                        position: 'relative',
                    }}
                >
                    {getTataLetakClass()}
                </div>
            </div >
        </AppWrapper >
    );
}
