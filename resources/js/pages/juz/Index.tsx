import AppWrapper from '@/components/layouts/app-wrapper';
import PageHeader from '@/components/layouts/main-header';
import { cn } from '@/lib/utils';
import { Head, usePage } from '@inertiajs/react';
import React, { JSX, useEffect, useState } from 'react';
import MistakeModal from '../../components/layouts/mistakeModal';
import { useTranslation } from 'react-i18next';

interface Word {
    id: number;
    position: number;
    location: string
    text_uthmani: string;
    char_type_name: string;
    line_number: number; // Optional, used for flexible layout
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

interface Juz {
    id: number;
    juz_number: number;
    pages: number[];
    verses_count: number;
}

interface ErrorLabel {
    id: number;
    key: string;
    value: string;
    color: string;
    status: number;
}

interface PageProps {
    juz: Juz;
    verses: Verse[];
    chapters: { [key: number]: Chapter };
    errorLabels: ErrorLabel[]
    setting?: boolean; // Optional setting property to handle user/group settings
    [key: string]: unknown; // Add index signature to satisfy Inertia PageProps constraint
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
            salah: string;
            word_location: string
        }>;
    };
}

export default function JuzIndex() {
    const { juz, verses, chapters, errorLabels, setting } = usePage<PageProps>().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
    const [selectedVerseId, setSelectedVerseId] = useState<number | null>(null);
    const [selectedJuz, setSelectedJuz] = useState<number>(0);
    const [wordErrors, setWordErrors] = useState<{ [key: number]: string }>({});
    const [verseErrors, setVerseErrors] = useState<{ [key: number]: string }>({});
    const [selectedWordText, setSelectedWordText] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [currentErrorLabels, setCurrentErrorLabels] = useState<ErrorLabel[] | null>(null);
    const [wordIndopak, setWordIndopak] = useState<WordIndopak | null>(null)
    const [wordUtsmani, setWordUtsmani] = useState<WordIndopak | null>(null)
    const { t, ready } = useTranslation("surah");
    const [moreThenContainer, setMoreThenContainer] = useState<boolean>(false)
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchDataIndopak() {
            try {
                // Path relatif ke file JSON Anda di folder public
                const response = await fetch('/assets/json/indopak-nastaleeq.json');

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

        fetchDataUtsmani();
        fetchDataIndopak();
    }, []);

    const checkContainer = () => {
        if (containerRef.current) {
            const currentWidth = containerRef.current.offsetWidth;
            const viewportWidth = window.innerWidth;

            // setWidthContent(currentWidth);
            setMoreThenContainer(currentWidth >= viewportWidth);
        }
    };

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);

        // Panggil sekali saat mount
        checkMobile();
        checkContainer();

        // Setup event listeners
        window.addEventListener('resize', checkMobile);
        window.addEventListener('resize', checkContainer);

        // Cleanup
        return () => {
            window.removeEventListener('resize', checkContainer);
            window.removeEventListener('resize', checkMobile);
        };
    }, [currentErrorLabels]); // Hapus dependency widthContent dari sini

    // Tambahkan useEffect untuk memantau perubahan containerRef
    useEffect(() => {
        const observer = new ResizeObserver(() => {
            checkContainer();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (verses.length === 0) {
            setModalOpen(true);
        }
    }, [verses]);

    useEffect(() => {
        const savedWordErrors = localStorage.getItem('wordErrors');
        const savedVerseErrors = localStorage.getItem('verseErrors');
        if (savedWordErrors) setWordErrors(JSON.parse(savedWordErrors));
        if (savedVerseErrors) setVerseErrors(JSON.parse(savedVerseErrors));
    }, []);

    useEffect(() => {
        const errorsByPage = generateErrorsByPage();
        const existingData = localStorage.getItem('setoran-data');
        let dataToSave = {
            reciter: { id: '12345', full_name: 'Ahmad Ridwan bin Abdullah' },
            setoran_type: 'tahsin',
            display: 'juz',
            surah: {
                id: `juz-${juz.juz_number}`,
                name: `Juz ${juz.juz_number}`,
                from: '1',
                to: '1',
            },
            mistake: errorsByPage,
        };
        if (existingData) {
            const parsedData = JSON.parse(existingData);
            dataToSave = { ...parsedData, surah: dataToSave.surah, mistake: errorsByPage };
            setSelectedJuz(parseInt(parsedData.selectedJuz, 10));
            localStorage.setItem('setoran-data', JSON.stringify(dataToSave));
        }
    }, [wordErrors, verseErrors, currentErrorLabels]);

    useEffect(() => {
        localStorage.setItem('wordErrors', JSON.stringify(wordErrors));
        localStorage.setItem('verseErrors', JSON.stringify(verseErrors));
    }, [wordErrors, verseErrors]);

    const handleClick = (type: 'word' | 'verse', id: number) => {
        if (type === 'word') {
            setSelectedWordId(id);
            setSelectedVerseId(null);
            const word = verses.flatMap((v) => v.words).find((w) => w.id === id);
            setSelectedWordText(word ? word.text_uthmani : null);
        } else {
            setSelectedVerseId(id);
            setSelectedWordId(null);
            setSelectedWordText(null);
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

    const validateErrorLabels = (): ErrorLabel[] => {
        if (currentErrorLabels) {
            return currentErrorLabels
        } else {
            return errorLabels
        }
    }

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

    if (wordIndopak === null || !ready) {
        return null;
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

        // Cek apakah style dengan fontName sudah ada
        const existingStyle = Array.from(document.head.querySelectorAll('style'))
            .find(style => style.innerHTML.includes(`font-family: '${fontName}'`));

        if (existingStyle) {
            // Font sudah dimuat, tidak perlu inject ulang
            return fontName;
        }

        // Buat elemen style untuk inject font-face
        const style = document.createElement('style');
        style.innerHTML = `
        @font-face {
            font-family: '${fontName}';
            src: url('${fontUrl}') format('woff2');
            font-display: swap;
        }

        .${fontName} {
            font-family: '${fontName}';
        }
    `;
        document.head.appendChild(style);

        return fontName;
    }

    function renderFleksibel(): JSX.Element {
        return (
            <>
                {verses.map((verse, index) => {
                    const surahId = parseInt(verse.verse_key.split(':')[0]);
                    const prevVerse = index > 0 ? verses[index - 1] : null;
                    const isNewSurah = !prevVerse || surahId !== parseInt(prevVerse.verse_key.split(':')[0]);
                    const verseLabel = verseErrors[verse.id]
                        ? validateErrorLabels().find((l: ErrorLabel) => l.key === verseErrors[verse.id])
                        : null;

                    const classUtsmani = loadFontFace(verse.page_number)

                    return (
                        <>
                            {isNewSurah && (
                                <div key={`surah-${surahId}`} className="mb-6 text-center">
                                    <h2 className={`${fontType() == "IndoPak" ? "font-arabic-indopak" : "font-arabic"} text-3xl font-bold dark:text-gray-300`}>{chapters[surahId].name_arabic}</h2>
                                    <p style={{
                                        fontSize: '16px',
                                        color: '#555',
                                        marginBottom: '10px'
                                    }}>
                                        {chapters[surahId].name_simple} ({t(`surah.${surahId}`)})
                                    </p>
                                    {chapters[surahId].bismillah_pre && (
                                        <p className={`${fontType() == "IndoPak" ? "font-arabic-indopak" : "font-arabic"} mt-4 text-3xl text-black dark:text-gray-300`}>
                                            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                                        </p>
                                    )}
                                </div>
                            )}
                            <span key={verse.id}>
                                <span
                                    className={cn('transition-colors duration-200', verseLabel && 'dark:text-gray-900')}
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
                                        const wordLabels = wordLabel;
                                        return (
                                            <span
                                                key={word.id}
                                                className={cn(
                                                    `${fontType() == "IndoPak" ? "font-arabic-indopak" : "font-arabic"} cursor-pointer text-gray-700 transition-colors duration-200 hover:text-blue-300 dark:hover:text-blue-300`,
                                                    wordLabels || verseLabel ? 'dark:text-gray-900' : 'dark:text-gray-300',
                                                )}
                                                style={{
                                                    fontSize: getFontSizeClass(),
                                                    backgroundColor: wordLabels?.color || 'transparent',
                                                    display: "inline-block", // Changed to inline-block for flexible layout
                                                    // display: getTataLetakClass() == "fleksibel" ? "inline-block" : "inline",
                                                    borderRadius: wordLabels ? '6px' : '0',
                                                    margin: wordLabel ? '0 1px' : '0',
                                                    padding: wordLabel ? "0px 3px" : "0px 5px",
                                                    textAlign: "center",
                                                    lineHeight: "1.3",
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

                                {index < verses.length - 1 && verses[index + 1].page_number !== verse.page_number && (
                                    <div className="my-4 flex items-center">
                                        <hr className="flex-1 border-2 border-t border-gray-700 dark:border-gray-300" />
                                        <span className="mx-4 text-sm font-bold text-gray-700 dark:text-gray-300">Page {verse.page_number}</span>
                                        <hr className="flex-1 border-2 border-t border-gray-700 dark:border-gray-300" />
                                    </div>
                                )}
                            </span>
                        </>
                    );
                })}
            </>
        )
    }

    function renderMushaf(): JSX.Element {
        const versesByPage: { [pageNumber: number]: Verse[] } = {};
        verses.forEach(verse => {
            if (!versesByPage[verse.page_number]) {
                versesByPage[verse.page_number] = [];
            }
            versesByPage[verse.page_number].push(verse);
        });

        // Track displayed surahs per page
        const displayedSurahs = new Map<number, Set<number>>(); // pageNumber -> Set<surahId>

        return (
            <div style={{ maxWidth: "fit-content", margin: '0 auto' }}>
                {Object.keys(versesByPage).length > 0 ? (
                    Object.entries(versesByPage).map(([pageNumberStr, pageVerses]) => {
                        const pageNumber = parseInt(pageNumberStr);
                        const isValidationPage = pageNumber === 1 || pageNumber === 2;
                        const classUtsmani = fontType() !== "IndoPak" ? loadFontFace(pageNumber) : "";

                        // Initialize displayed surahs for this page
                        if (!displayedSurahs.has(pageNumber)) {
                            displayedSurahs.set(pageNumber, new Set<number>());
                        }
                        const pageDisplayedSurahs = displayedSurahs.get(pageNumber)!;

                        // Group all words by line_number across all verses in this page
                        const wordsByLine: { [lineNumber: number]: { verse: Verse, word: Word }[] } = {};
                        const surahHeaders: { [lineNumber: number]: JSX.Element } = {};

                        // First pass: Identify where surah headers should appear
                        pageVerses.forEach(verse => {
                            const surahId = parseInt(verse.verse_key.split(':')[0]);
                            if (!pageDisplayedSurahs.has(surahId)) {
                                pageDisplayedSurahs.add(surahId);

                                // Find the first line of this surah on this page
                                const firstWord = verse.words.find(w => w.line_number !== undefined);
                                if (firstWord && firstWord.line_number !== undefined && verse.verse_number === 1) {

                                    surahHeaders[firstWord.line_number] = (
                                        <div
                                            key={`surah-${surahId}-${pageNumber}`}
                                            style={{
                                                textAlign: 'center',
                                                margin: '10px 0 5px',
                                                padding: '0'
                                            }}
                                        >
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
                                                        margin: '15px 0 10px'
                                                    }}>
                                                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                            }

                            verse.words.forEach(word => {
                                if (word.line_number !== undefined) {
                                    if (!wordsByLine[word.line_number]) {
                                        wordsByLine[word.line_number] = [];
                                    }
                                    wordsByLine[word.line_number].push({ verse, word });
                                }
                            });
                        });

                        return (
                            <div key={pageNumber} style={{ margin: '0 auto' }}>
                                {Object.entries(wordsByLine).map(([lineNumberStr, lineWords]) => {
                                    const lineNumber = parseInt(lineNumberStr);

                                    // Group words by verse in this line
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
                                                    justifyContent: isValidationPage ? 'center' : 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '5px',
                                                    width: '100%',
                                                    direction: 'rtl',
                                                    textAlign: isValidationPage ? 'center' : 'justify'
                                                }}
                                            >
                                                {Object.entries(wordsByVerse).map(([verseIdStr, words]) => {
                                                    const verseId = parseInt(verseIdStr);
                                                    const verse = verses.find(v => v.id === verseId);
                                                    const verseLabel = verseErrors[verseId]
                                                        ? errorLabels.find((l) => l.key === verseErrors[verseId])
                                                        : null;

                                                    const totalWordsInVerse = words.length;

                                                    return (
                                                        <div
                                                            key={verseId}
                                                            style={{
                                                                backgroundColor: verseLabel?.color || 'transparent',
                                                                borderRadius: verseLabel ? '6px' : '0',
                                                                padding: verseLabel ? "2px 3px" : "0",
                                                                margin: '0 1px',
                                                                display: 'flex',
                                                                justifyContent: isValidationPage ? 'center' :
                                                                    (totalWordsInVerse <= 2 ? 'flex-start' : 'space-between'),
                                                                alignItems: 'center',
                                                                flex: isValidationPage ? 'none' :
                                                                    (totalWordsInVerse <= 2 ? '0 1 auto' : '1 1 auto'),
                                                                minWidth: 'fit-content',
                                                                gap: totalWordsInVerse <= 2 ? '4px' : '0px'
                                                            }}
                                                        >
                                                            {words.map((word) => {
                                                                const wordLabel = wordErrors[word.id]
                                                                    ? errorLabels.find((l) => l.key === wordErrors[word.id])
                                                                    : null;

                                                                const showWordHighlight = wordLabel || verseLabel;

                                                                return (
                                                                    <span
                                                                        key={word.id}
                                                                        style={{
                                                                            fontSize: getFontSizeClass(),
                                                                            backgroundColor: showWordHighlight ? wordLabel?.color : 'transparent',
                                                                            borderRadius: showWordHighlight ? '4px' : '0',
                                                                            padding: showWordHighlight ? "1px 1px" : "0 1px",
                                                                            display: 'inline-block',
                                                                            lineHeight: '1.5',
                                                                            textAlign: 'center',
                                                                            flex: isValidationPage ? 'none' :
                                                                                (totalWordsInVerse <= 2 ? '0 0 auto' : '0 0 auto'),
                                                                            minWidth: 'min-content'
                                                                        }}
                                                                        className={cn(
                                                                            `cursor-pointer text-gray-700 transition-colors duration-200 hover:text-blue-300 dark:hover:text-blue-300`,
                                                                            showWordHighlight ? 'dark:text-gray-900' : 'dark:text-gray-300',
                                                                        )}
                                                                    >
                                                                        {word.char_type_name == "word" && (
                                                                            <span
                                                                                className={fontType() == "IndoPak" ? "font-arabic-indopak" : `${classUtsmani}`}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleClick('word', word.id);
                                                                                }}
                                                                            >
                                                                                {getFont(word.location)}
                                                                            </span>
                                                                        )}
                                                                        {word.char_type_name == "end" && (
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
                                                                        )}
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
                                {pageVerses.length > 0 && (
                                    <div className="my-4 flex items-center">
                                        <hr className={`flex-1 border-2 border-t border-gray-300`} />
                                        <span className={`mx-4 text-sm font-bold text-gray-700 dark:text-white`}>
                                            Page {pageNumber}
                                        </span>
                                        <hr className={`flex-1 border-2 border-t border-gray-300`} />
                                    </div>
                                )}
                            </div>
                        );
                    })
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
            // return renderMushaf()
            if (moreThenContainer || tataletakValue === "fleksibel") {
                return renderFleksibel();
            }
            if (!moreThenContainer || typeof fontSize === "number" && fontSize < 5) {
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
            <Head title="Juz" />
            <PageHeader page={1} translateMode="read" classNav="" target={`/result/juz/${selectedJuz}`} errorLabels={validateErrorLabels()} onUpdateErrorLabels={setCurrentErrorLabels} setting={setting} />
            <div className="mx-auto overflow-auto">
                <MistakeModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedWordId(null);
                        setSelectedVerseId(null);
                        setSelectedWordText(null);
                    }}
                    onLabelSelect={handleLabelSelect}
                    onRemoveLabel={handleRemoveLabel}
                    errorLabels={validateErrorLabels()}
                    versesEmpty={verses.length === 0}
                    selectedWordId={selectedWordId}
                    selectedVerseId={selectedVerseId}
                    selectedWordText={selectedWordText}
                    wordErrors={wordErrors}
                    verseErrors={verseErrors}
                />
                <div className="mt-20 mb-10 text-center" key={0}>
                    <p className={`text-lg dark:text-gray-300`}>Juz {juz.juz_number}</p>
                </div>
                <div
                    ref={containerRef}
                    style={{
                        position: 'absolute',
                        visibility: 'hidden',
                        maxWidth: "fit-content",
                        margin: '0 auto'
                    }}
                >
                    {renderMushaf()}  {/* Pisahkan konten mushaf ke fungsi terpisah */}
                </div>
                <div
                    className={` dark:text-gray-300 pb-[100px] md:pb-0`}
                    style={{
                        direction: 'rtl',
                        textAlign: 'justify',
                        textJustify: 'inter-word',
                        lineHeight: '1.5',
                        position: 'relative',
                    }}
                >
                    {
                        getTataLetakClass()
                    }

                </div>
            </div>
        </AppWrapper>
    );
}
