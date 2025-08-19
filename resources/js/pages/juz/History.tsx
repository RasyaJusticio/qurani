import AppWrapper from '@/components/layouts/app-wrapper';
import RecapHeader from '@/components/layouts/recap-header';
import { cn } from '@/lib/utils';
import { Head, usePage } from '@inertiajs/react';
import React, { useEffect, useState, useRef, JSX } from 'react';
import { useTranslation } from 'react-i18next';

interface Word {
    id: number;
    position: number;
    text_uthmani: string;
    text_indopak: string;
    char_type_name: string;
    location: string;
    line_number?: number;
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

interface WordUtsmani {
    [key: string]: {
        id: number;
        surah: number;
        ayah: string;
        word: string;
        location: string
        text: string
    }
}

interface PageProps {
    juz: Juz;
    verses: Verse[];
    chapters: { [key: number]: Chapter };
    [key: string]: unknown; // Add index signature to satisfy Inertia's PageProps constraint
}

const errorLabels = [
    { key: 'sa-1', color: '#CCCCCC' },
    { key: 'sa-2', color: '#99CCFF' },
    { key: 'sa-3', color: '#DFF18F' },
    { key: 'sa-4', color: '#F4ACB6' },
    { key: 'sa-5', color: '#FA7656' },
    { key: 'sk-1', color: '#FFCC99' },
    { key: 'sk-2', color: '#F4A384' },
    { key: 'sk-3', color: '#F8DD74' },
    { key: 'sk-4', color: '#FA7656' },
    { key: 'sk-5', color: '#B5C9DF' },
    { key: 'sk-6', color: '#FE7D8F' },
    { key: 'sk-7', color: '#A1D4CF' },
    { key: 'sk-8', color: '#90CBAA' },
    { key: 'sk-9', color: '#FA7656' },
    { key: 'sk-10', color: '#FE7D8F' },
    { key: 'sk-11', color: '#90CBAA' },
    { key: 'sk-12', color: '#F8DD74' },
    { key: 'sk-13', color: '#CC99CC' },
    { key: 'sk-14', color: '#CCCCCC' },
];

export default function JuzRecap() {
    const { juz, verses, chapters } = usePage<PageProps>().props;
    const [popupError, setPopupError] = useState<{
        type: 'word' | 'verse';
        id: number;
        label: string;
        locationText: string;
        className?: string
    } | null>(null);
    const [wordErrors, setWordErrors] = useState<{
        [key: number]: {
            key: string,
            label: string,
        }
    }>({});
    const [verseErrors, setVerseErrors] = useState<{
        [key: number]: {
            key: string,
            label: string,
        }
    }>({});
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        text: string;
        x: number;
        y: number;
    } | null>(null);
    const [wordUtsmani, setWordUtsmani] = useState<WordUtsmani | null>(null)
    const spanRefs = useRef<{ [key: string]: HTMLSpanElement }>({});
    const { t, ready } = useTranslation("surah");

    useEffect(() => {
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
    }, [])

    useEffect(() => {
        const loadErrorsFromLocalStorage = () => {
            try {
                const existingData = localStorage.getItem('setoran-data');
                if (existingData) {
                    const data = JSON.parse(existingData);
                    if (data.mistake && typeof data.mistake === 'object') {
                        // const newWordErrors: { [key: number]: string } = {};
                        // const newVerseErrors: { [key: number]: string } = {};
                        const newWordErrors: {
                            [key: number]: {
                                key: string,
                                label: string,
                            }
                        } = {};
                        const newVerseErrors: {
                            [key: number]: {
                                key: string,
                                label: string,
                            }
                        } = {};

                        Object.values(data.mistake).forEach((mistakeData: any) => {
                            if (mistakeData.salah_kata && Array.isArray(mistakeData.salah_kata)) {
                                mistakeData.salah_kata.forEach((wordError: any) => {
                                    const wordLocation = wordError.word_location;
                                    verses.forEach((verse) => {
                                        verse.words.forEach((word) => {
                                            if (word.location === wordLocation) {
                                                newWordErrors[word.id] = { key: wordError.salahKey, label: wordError.salah };
                                            }
                                        });
                                    });
                                });
                            }

                            if (mistakeData.salah_ayat && Array.isArray(mistakeData.salah_ayat)) {
                                mistakeData.salah_ayat.forEach((verseError: any) => {
                                    const verseNumber = verseError.noAyat;
                                    const verse = verses.find((v) => v.verse_number === verseNumber);
                                    if (verse) {
                                        newVerseErrors[verse.id] = { key: verseError.salahKey, label: verseError.salah };
                                    }
                                });
                            }
                        });

                        setWordErrors(newWordErrors);
                        setVerseErrors(newVerseErrors);

                    }
                }
            } catch (error) {
                console.error('Error loading errors from localStorage:', error);
            }
        };

        loadErrorsFromLocalStorage();
    }, [verses]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setPopupError(null);
                setTooltip(null);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleMouseEnter = (
        type: 'word' | 'verse',
        id: number,
        label: string,
        locationText: string,
        event: React.MouseEvent<HTMLSpanElement>,
    ) => {
        if (label) {
            const rect = event.currentTarget.getBoundingClientRect();
            setTooltip({
                visible: true,
                text: label,
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
            });
        }
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    const groupedVerses = verses.reduce(
        (acc, verse, index) => {
            const page = verse.page_number;
            if (!acc[page]) {
                acc[page] = [];
            }
            acc[page].push({ verse, index });
            return acc;
        },
        {} as { [key: number]: { verse: Verse; index: number }[] },
    );

    function getFont(location: string): string {
        if (!wordUtsmani || !wordUtsmani[`${location}`]) {
            return '';
        }
        return wordUtsmani[`${location}`]?.text || '';
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
                        const classUtsmani = loadFontFace(pageNumber);

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
                                                    fontFamily: "'Uthmani', 'Traditional Arabic'",
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
                                                        fontFamily: "'Uthmani', 'Traditional Arabic'",
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
                                                        ? errorLabels.find((l) => l.key === verseErrors[verseId].key)
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
                                                                    ? errorLabels.find((l) => l.key === wordErrors[word.id].key)
                                                                    : null;

                                                                const showWordHighlight = wordLabel || verseLabel;

                                                                return (
                                                                    <span
                                                                        key={word.id}
                                                                        style={{
                                                                            fontSize: "1.5rem",
                                                                            // fontSize: getFontSizeClass(),
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
                                                                                className={`${classUtsmani}`}
                                                                                ref={(el) => {
                                                                                    if (el) spanRefs.current[`word-${word.id}`] = el;
                                                                                }}
                                                                                onClick={
                                                                                    wordLabel
                                                                                        ? () =>
                                                                                            setPopupError({
                                                                                                type: 'word',
                                                                                                id: word.id,
                                                                                                label: wordErrors[word.id].label,
                                                                                                locationText: getFont(word.location),
                                                                                                className: classUtsmani
                                                                                            })
                                                                                        : undefined
                                                                                }
                                                                                onMouseEnter={(e) =>
                                                                                    handleMouseEnter('word', word.id, wordErrors[word.id].label, word.text_uthmani, e)
                                                                                }
                                                                                onMouseLeave={handleMouseLeave}
                                                                            >
                                                                                {getFont(word.location)}
                                                                            </span>
                                                                        )
                                                                        }
                                                                        {
                                                                            word.char_type_name == "end" && (
                                                                                <span
                                                                                    ref={(el) => {
                                                                                        if (el) spanRefs.current[`verse-end-${verseId}`] = el;
                                                                                    }}
                                                                                    className={classUtsmani}
                                                                                    onClick={
                                                                                        verseLabel
                                                                                            ? () =>
                                                                                                setPopupError({
                                                                                                    type: 'verse',
                                                                                                    id: verseId,
                                                                                                    label: verseErrors[verseId].label,
                                                                                                    locationText: `Ayat ke-${verse?.verse_number}`,
                                                                                                })
                                                                                            : undefined
                                                                                    }
                                                                                    onMouseEnter={(e) =>
                                                                                        handleMouseEnter('verse', verseId, verseErrors[verseId].label, `Ayat ke-${verse?.verse_number}`, e)
                                                                                    }
                                                                                    onMouseLeave={handleMouseLeave}
                                                                                >
                                                                                    {getFont(word.location)}
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
                )
                }
            </div >
        );
    }

    if (!ready) {
        return null
    }

    return (
        <AppWrapper>
            <Head title={`Page ${juz.juz_number} - Recap`} />
            <RecapHeader page={1} translateMode="read" target="/result/juz" />
            <div className="mx-auto max-w-4xl overflow-auto p-4">
                <div className="mt-20 mb-12 text-center">
                    <p className={`text-lg dark:text-gray-300`}>Juz {juz.juz_number}</p>
                </div>
                <div
                    className={`font-arabic text-3xl dark:text-gray-300`}
                    style={{
                        direction: 'rtl',
                        textAlign: 'justify',
                        textJustify: 'inter-word',
                        lineHeight: '2',
                        wordSpacing: '0.05em',
                        letterSpacing: '0.03em',
                    }}
                >
                    {
                        // verses.map((verse, index) => {
                        //     const surahId = parseInt(verse.verse_key.split(':')[0]);
                        //     const prevVerse = index > 0 ? verses[index - 1] : null;
                        //     const isNewSurah = !prevVerse || surahId !== parseInt(prevVerse.verse_key.split(':')[0]);
                        //     const verseLabel = verseErrors[verse.id] || null;
                        //     const colorVerseLabel = verseErrors[verse.id]
                        //         ? errorLabels.find((l) => l.key === verseLabel.key)
                        //         : null;
                        //     return (
                        //         <>
                        //             {isNewSurah && (
                        //                 <div key={`surah-${surahId}`} className="mb-6 text-center">
                        //                     <h2 className="font-arabic text-3xl font-bold dark:text-gray-300">{chapters[surahId].name_arabic}</h2>
                        //                     <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                        //                         {chapters[surahId].translated_name.name} ({chapters[surahId].name_simple})
                        //                     </p>
                        //                     {chapters[surahId].bismillah_pre && (
                        //                         <p className="font-arabic mt-4 text-3xl text-black dark:text-gray-300">
                        //                             بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                        //                         </p>
                        //                     )}
                        //                 </div>
                        //             )}
                        //             <span key={verse.id}>
                        //                 <span className={cn('transition-colors duration-200', verseLabel && 'dark:text-gray-900')}
                        //                     style={{
                        //                         backgroundColor: colorVerseLabel?.color || 'transparent',
                        //                         // display: verseLabel ? 'inline-block' : '',
                        //                         padding: verseLabel ? '3.5px 6px' : '0',
                        //                         lineHeight: verseLabel ? '1.5' : '2',
                        //                         borderRadius: verseLabel ? '6px' : '0',
                        //                         marginRight: '8px',
                        //                         verticalAlign: 'middle',
                        //                     }}>
                        //                     {verse.words.map((word) => {
                        //                         const colorWordLabel = wordErrors[word.id]
                        //                             ? errorLabels.find((l) => l.key === wordErrors[word.id].key)
                        //                             : null;
                        //                         const wordLabels = wordErrors[word.id] || null;

                        //                         return (
                        //                             <span
                        //                                 key={word.id}
                        //                                 className={cn(
                        //                                     'cursor-pointer text-gray-700 transition-colors duration-200 hover:text-blue-300 dark:hover:text-blue-300',
                        //                                     wordLabels || verseLabel ? 'dark:text-gray-900' : 'dark:text-gray-300',
                        //                                 )}
                        //                                 style={{
                        //                                     backgroundColor: colorWordLabel?.color || 'transparent',
                        //                                     display: 'inline',
                        //                                     lineHeight: wordLabels ? '0' : '1',
                        //                                     padding: wordLabels ? '9px 6px' : '0',
                        //                                     borderRadius: wordLabels ? '6px' : '0',
                        //                                     margin: wordLabels ? '4px 0' : '0',
                        //                                 }}
                        //                                 ref={(el) => {
                        //                                     if (el) spanRefs.current[`word-${word.id}`] = el;
                        //                                 }}
                        //                                 onClick={
                        //                                     wordLabels
                        //                                         ? () =>
                        //                                             setPopupError({
                        //                                                 type: 'word',
                        //                                                 id: word.id,
                        //                                                 label: wordLabels.label,
                        //                                                 locationText: word.text_uthmani,
                        //                                             })
                        //                                         : undefined
                        //                                 }
                        //                                 onMouseEnter={(e) =>
                        //                                     handleMouseEnter('word', word.id, wordLabels.label, word.text_uthmani, e)
                        //                                 }
                        //                                 onMouseLeave={handleMouseLeave}
                        //                             >
                        //                                 {word.text_uthmani}{' '}
                        //                             </span>

                        //                         );
                        //                     })}
                        //                     {/* <span
                        //                         className="cursor-pointer transition-colors duration-200 hover:text-blue-300 relative"
                        //                         style={{
                        //                             backgroundColor: colorVerseLabel?.color || 'transparent',
                        //                             display: 'inline',
                        //                         }}
                        //                         ref={(el) => {
                        //                             if (el) spanRefs.current[`verse-end-${verse.id}`] = el;
                        //                         }}
                        //                         onClick={
                        //                             verseLabel
                        //                                 ? () =>
                        //                                     setPopupError({
                        //                                         type: 'verse',
                        //                                         id: verse.id,
                        //                                         label: verseLabel.label,
                        //                                         locationText: `Ayat ke-${verse.verse_number}`,
                        //                                     })
                        //                                 : undefined
                        //                         }
                        //                         onMouseEnter={(e) =>
                        //                             handleMouseEnter('verse', verse.id, verseLabel.label, `Ayat ke-${verse.verse_number}`, e)
                        //                         }
                        //                         onMouseLeave={handleMouseLeave}
                        //                     >
                        //                         ۝{verse.end_marker || verse.verse_number}
                        //                     </span> */}
                        //                     <span
                        //                         className="cursor-pointer transition-colors duration-200 hover:text-blue-300 relative inline-flex items-center justify-center"
                        //                         style={{
                        //                             backgroundColor: colorVerseLabel?.color || 'transparent',
                        //                             display: 'inline-flex',
                        //                             width: '24px',
                        //                             height: '24px',
                        //                             borderRadius: '50%',
                        //                             marginLeft: '4px',
                        //                         }}
                        //                         ref={(el) => {
                        //                             if (el) spanRefs.current[`verse-end-${verse.id}`] = el;
                        //                         }}
                        //                         onClick={
                        //                             verseLabel
                        //                                 ? () =>
                        //                                     setPopupError({
                        //                                         type: 'verse',
                        //                                         id: verse.id,
                        //                                         label: verseLabel.label,
                        //                                         locationText: `Ayat ke-${verse.verse_number}`,
                        //                                     })
                        //                                 : undefined
                        //                         }
                        //                         onMouseEnter={(e) =>
                        //                             handleMouseEnter('verse', verse.id, verseLabel.label, `Ayat ke-${verse.verse_number}`, e)
                        //                         }
                        //                         onMouseLeave={handleMouseLeave}
                        //                     >
                        //                         ۝
                        //                         <span style={{
                        //                             position: 'absolute',
                        //                             fontSize: '12px',
                        //                             lineHeight: '1',
                        //                         }}>
                        //                             {verse.end_marker}
                        //                         </span>
                        //                     </span>
                        //                     {groupedVerses[verse.page_number][groupedVerses[verse.page_number].length - 1].verse.id ===
                        //                         verse.id && (
                        //                             <div className="my-4 flex items-center">
                        //                                 <hr className="flex-1 border-t border-gray-300" />
                        //                                 <span className="mx-4 text-sm font-medium text-gray-600">Page {verse.page_number}</span>
                        //                                 <hr className="flex-1 border-t border-gray-300" />
                        //                             </div>
                        //                         )}
                        //                 </span>
                        //             </span>
                        //         </>
                        //     )
                        // })
                        renderMushaf()
                    }
                </div>
                {popupError && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/55">
                        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
                            <p className="mb-2 text-2xl">
                                <strong className={popupError.className}>{popupError.locationText}</strong>
                            </p>
                            <p className="mb-4">
                                <span className="rounded px-2 py-1">{popupError.label}</span>
                            </p>
                            <button
                                onClick={() => setPopupError(null)}
                                className="mt-2 rounded bg-blue-600 px-2 py-2 text-white text-sm hover:bg-blue-700"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
                {tooltip && tooltip.visible && (
                    <div
                        className="fixed z-50 bg-black/80 text-white text-sm rounded-lg px-3 py-2 shadow-lg"
                        style={{
                            top: `${tooltip.y - 40}px`,
                            left: `${tooltip.x}px`,
                            transform: 'translateX(-50%)',
                            pointerEvents: 'none',
                        }}
                    >
                        {tooltip.text}
                        <div
                            className="absolute bottom-[-8px] left-1/2 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-black/80"
                            style={{ transform: 'translateX(-50%)' }}
                        />
                    </div>
                )}
            </div>
        </AppWrapper>
    )
}
