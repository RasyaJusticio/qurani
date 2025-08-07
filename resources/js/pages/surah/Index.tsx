import AppWrapper from '@/components/layouts/app-wrapper';
import QuranHeader from '@/components/layouts/main-header';
import { cn } from '@/lib/utils';
import { Head, router, usePage, useRemember } from '@inertiajs/react';
import React, { JSX, useEffect, useState } from 'react';
import MistakeModal from '../../components/layouts/mistakeModal';
import { Info } from 'lucide-react';

interface Word {
    id: number;
    position: number;
    text_uthmani: string;
    text_indopak: string;
    char_type_name: string;
    location: string;
    line_number?: number;
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

interface ErrorLabel {
    id: number;
    key: string;
    value: string;
    color: string;
    status: number;
}

interface Surah {
    id: number;
    revelation_place: string;
    bismillah_pre: boolean | null;
    name_simple: string;
    name_arabic: string;
    verses_count: number;
    translated_name: { name: string; language_name: string };
}

interface LineNumber {
    [key: number]: number;
}

interface PageProps {
    surah: Surah;
    verses: Verse[];
    errorLabels: ErrorLabel[];
    setting: boolean;
    lineNumber?: LineNumber;
    [key: string]: unknown;
}

interface SetoranData {
    display: string;
    penyetor: string;
    selectedFriend: string;
    selectedGroup: string;
    selectedHalaman: string;
    selectedJuz: string;
    selectedMember: string;
    selectedSurahValue: string;
    setoran: string;
    tampilkan: string;
}

type ErrorsByPage = {
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
};

export default function SurahIndex() {
    const { props } = usePage<PageProps>();
    // Pastikan errorLabels memiliki nilai default yang sesuai dengan tipe barunya
    const { surah, verses, errorLabels, setting } = props || { surah: null, verses: [], errorLabels: { user: [], grup: [] } };
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
    const [selectedVerseId, setSelectedVerseId] = useState<number | null>(null);
    const [selectedWordText, setSelectedWordText] = useState<string | null>(null);
    const [penyetor, setPenyetor] = useState<string>('');
    const [selectedGrup, setSelectedGroup] = useState<number>(0);
    const [wordErrors, setWordErrors] = useState<{ [key: number]: string }>({});
    const [verseErrors, setVerseErrors] = useState<{ [key: number]: string }>({});
    const [currentErrorLabels, setCurrentErrorLabels] = useState<ErrorLabel[] | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [shouldReload, setShouldReload] = useRemember(false);
    const [wordIndopak, setWordIndopak] = useState<WordIndopak | null>(null)
    const [wordUtsmani, setWordUtsmani] = useState<WordIndopak | null>(null)

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

        fetchDataIndopak();
        fetchDataUtsmani();
    }, []);

    useEffect(() => {
        // Periksa apakah errorLabels juga tersedia
        if (!surah || !verses || !errorLabels) {
            console.error('Data surah, verses, atau errorLabels tidak tersedia dari server.');
            return;
        }
        const savedWordErrors = localStorage.getItem('wordErrors');
        const savedVerseErrors = localStorage.getItem('verseErrors');

        if (savedWordErrors) setWordErrors(JSON.parse(savedWordErrors));
        if (savedVerseErrors) setVerseErrors(JSON.parse(savedVerseErrors));
    }, [errorLabels]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!surah || !verses) return;

        if (verses.length === 0) {
            setModalOpen(true);
        }
    }, [verses, surah]); // Tambahkan surah ke dependency

    useEffect(() => {
        if (!surah || !verses || !errorLabels) return; // Pastikan errorLabels juga tersedia

        const errorsByPage = generateErrorsByPage();
        const existingData = localStorage.getItem('setoran-data');

        const startVerse = verses.length > 0 ? verses[0].verse_number : 1;
        const endVerse = verses.length > 0 ? verses[verses.length - 1].verse_number : surah.verses_count;

        // const pageNumber = verses.length > 0 ? verses[0].page_number : 1; // Variabel ini tidak digunakan
        const surahDetails = [
            {
                id: surah.id.toString(),
                name: surah.name_simple,
                first_verse: startVerse.toString(),
                last_verse: endVerse.toString(),
            },
        ];

        let dataToSave = {
            reciter: { id: '12345', full_name: 'Ahmad Ridwan bin Abdullah' },
            setoran_type: 'tahsin',
            display: 'surat',
            surah: surahDetails,
            mistake: errorsByPage,
        };

        if (existingData) {
            const parsedData = JSON.parse(existingData);
            // Pastikan parsedData.penyetor adalah string sebelum diset
            if (typeof parsedData.penyetor === 'string') {
                setPenyetor(parsedData.penyetor);
                setSelectedGroup(parseInt(parsedData.selectedGroup, 10));
            }
            dataToSave = { ...parsedData, surah: dataToSave.surah, mistake: errorsByPage };
        }

        localStorage.setItem('setoran-data', JSON.stringify(dataToSave));
    }, [wordErrors, verseErrors, surah, verses, errorLabels, currentErrorLabels]); // Tambahkan errorLabels ke dependency

    useEffect(() => {
        localStorage.setItem('wordErrors', JSON.stringify(wordErrors));
        localStorage.setItem('verseErrors', JSON.stringify(verseErrors));
    }, [wordErrors, verseErrors]);

    useEffect(() => {
        if (shouldReload) {
            console.log("p")
            router.reload({
                only: ['errorLabels'], // Ganti dengan prop yang sesuai
                // preserveScroll: true,
                onFinish: () => {
                    setShouldReload(false); // Reset flag setelah reload selesai
                    console.log('Data berhasil diperbarui');
                },
                onError: () => {
                    setShouldReload(false); // Reset flag jika error
                }
            });
        }
    }, [shouldReload]);

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
        setSelectedWordText(null);
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
        setSelectedWordText(null);
    };

    const validateErrorLabels = (): ErrorLabel[] => {
        if (currentErrorLabels) {
            return currentErrorLabels;
        } else {
            return errorLabels || [];
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
                    errorsByPage[page].salahAyat.push({
                        salahKey: errorKey,
                        NamaSurat: surah.name_simple,
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

    function handelInfoChapter(id: number) {
        router.visit(`/info/${id}`)
    }

    function getFontSizeClass() {
        let fontSizeValue = isMobile ? 0 : 30;
        const kaliFont = isMobile ? 5 : 6; // Adjust multiplier based on mobile or desktop
        const labels = validateErrorLabels();

        if (labels) {
            const fontSizeLabel = labels.find((v) => v.key === "font-size");
            if (fontSizeLabel) {
                const parsedValue = parseInt(fontSizeLabel.value, 10);
                if (!isNaN(parsedValue)) {
                    fontSizeValue = parsedValue * kaliFont; // Multiply by kaliFont for larger font size
                }
            }
        }
        return `${fontSizeValue}px`;
    }

    // function checkFontSizeDisplay() {
    //     const labels = validateErrorLabels();

    //     if (labels) {
    //         const fontSizeLabel = labels.find((v) => v.key === "font-size");
    //         if (fontSizeLabel) {
    //             const parsedValue = parseInt(fontSizeLabel.value, 10);
    //             if (parsedValue >= 4 && isMobile) {
    //                 return "inline"; // Font size is set to a positive value
    //             } else {
    //                 return "flex"; // Font size is not set to a positive value
    //             }
    //         }
    //     }
    // }

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

    function getTataLetakClass(): JSX.Element {
        const labels = validateErrorLabels();
        const tataLetakValue = labels?.find((v) => v.key === "tata-letak")?.value || "fleksibel";

        if (tataLetakValue == "fleksibel") {
            return (
                <>
                    {verses.length > 0 ? (
                        verses.map((verse, index) => {
                            const verseLabel = verseErrors[verse.id]
                                ? validateErrorLabels().find((l: ErrorLabel) => l.key === verseErrors[verse.id])
                                : null;
                            return (
                                <span key={verse.id} className={`${index < verses.length - 1 && 'ml-0'}`}>
                                    <span
                                        key={verse.id}
                                        className={cn(
                                            `text-gray-900 transition-colors duration-200`,
                                            verseLabel ? 'dark:text-gray-900' : 'dark:text-gray-300',
                                        )}
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
                                            const allAvailableLabels = errorLabels;
                                            const wordLabel = wordErrors[word.id]
                                                ? allAvailableLabels.find((l) => l.key === wordErrors[word.id])
                                                : null;
                                            const versesLabel = verseErrors[verse.id];
                                            const wordLabels = wordLabel || versesLabel;
                                            return (
                                                <span
                                                    key={word.id}
                                                    className={cn(
                                                        `${fontType() == "IndoPak" ? "font-arabic-indopak" : "font-arabic"} cursor-pointer text-gray-700 transition-colors duration-200 hover:text-blue-300 dark:hover:text-blue-300`,
                                                        wordLabels ? 'dark:text-gray-900' : 'dark:text-gray-300',
                                                    )}
                                                    style={{
                                                        fontSize: getFontSizeClass(),
                                                        backgroundColor: wordLabels?.color || 'transparent',
                                                        display: "inline-block",
                                                        borderRadius: wordLabels ? '6px' : '0',
                                                        margin: wordLabel ? '0 1px' : '0',
                                                        padding: wordLabel ? "0px 3px" : "0px 5px",
                                                        textAlign: "center",
                                                        lineHeight: "1.2",
                                                        verticalAlign: 'middle',
                                                    }}
                                                >
                                                    {
                                                        word.char_type_name == "word" && (
                                                            <span onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleClick('word', word.id);
                                                            }} className={fontType() == "IndoPak" ? "font-arabic-indopak" : "font-arabic"}>
                                                                {fontType() == "IndoPak" ? getFont(word.location) : word.text_uthmani}
                                                            </span>
                                                        )
                                                    }
                                                    {word.char_type_name == "end" && (
                                                        <span
                                                            className="font-arabic cursor-pointer transition-colors duration-200 hover:text-blue-300"
                                                            onClick={() => handleClick('verse', verse.id)}
                                                        >
                                                            {
                                                                fontType() == "IndoPak" ? (
                                                                    <span className="font-arabic-indopak">
                                                                        {getFont(word.location)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="font-arabic">
                                                                        ۝{word.text_uthmani}
                                                                    </span>
                                                                )
                                                            }
                                                        </span>
                                                    )}
                                                </span>
                                            );
                                        })}

                                        {/* <span
                                            className="font-arabic cursor-pointer transition-colors duration-200 hover:text-blue-300"
                                            onClick={() => handleClick('verse', verse.id)}
                                        >
                                            ۝{verse.end_marker || verse.verse_number}
                                        </span> */}
                                    </span>

                                    {groupedVerses[verse.page_number][groupedVerses[verse.page_number].length - 1].verse.id === verse.id && (
                                        <div className="my-4 flex items-center">
                                            <hr className={`flex-1 border-2 border-t border-gray-300`} />
                                            <span className={`mx-4 text-sm font-bold text-gray-700 dark:text-white  `}>
                                                Page {verse.page_number}
                                            </span>
                                            <hr className={`flex-1 border-2 border-t border-gray-300`} />
                                        </div>
                                    )}
                                    {index < verses.length - 1 && ''}
                                </span>
                            );
                        })
                    ) : (
                        <div className={`text-gray-700`}>Tidak ada data ayat untuk ditampilkan.</div>
                    )}
                </>
            );
        }
        else {
            const versesByPage: { [pageNumber: number]: Verse[] } = {};
            verses.forEach(verse => {
                if (!versesByPage[verse.page_number]) {
                    versesByPage[verse.page_number] = [];
                }
                versesByPage[verse.page_number].push(verse);
            });
            return (
                <div style={{
                    width: "fit-content",
                    margin: '0 auto',
                }}>
                    {Object.keys(versesByPage).length > 0 ? (
                        Object.entries(versesByPage).map(([pageNumberStr, pageVerses]) => {
                            const pageNumber = parseInt(pageNumberStr);
                            const isValidationPage = pageNumber === 1 || pageNumber === 2;

                            // Group all words by line_number across all verses in this page
                            const wordsByLine: { [lineNumber: number]: { verse: Verse, word: Word }[] } = {};
                            pageVerses.forEach(verse => {
                                verse.words.forEach(word => {
                                    if (word.line_number !== undefined) {
                                        if (!wordsByLine[word.line_number]) {
                                            wordsByLine[word.line_number] = [];
                                        }
                                        wordsByLine[word.line_number].push({ verse, word });
                                    }
                                });
                            });

                            const classUtsmani = loadFontFace(pageNumber)

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
                                            <div
                                                key={lineNumber}
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
                                                                            margin: '0 2px',
                                                                            padding: showWordHighlight ? "1px 2px" : "0 2px",
                                                                            display: 'inline-block',
                                                                            lineHeight: '1.5',
                                                                            textAlign: 'center',
                                                                            flex: isValidationPage ? 'none' :
                                                                                (totalWordsInVerse <= 2 ? '0 0 auto' : '0 0 auto'),
                                                                            minWidth: 'min-content'
                                                                        }}
                                                                        className={cn(
                                                                            `cursor-pointer text-gray-700 transition-colors duration-200
                                                                    hover:text-blue-300 dark:hover:text-blue-300`,
                                                                            showWordHighlight ? 'dark:text-gray-900' : 'dark:text-gray-300',
                                                                        )}
                                                                    >
                                                                        {
                                                                            word.char_type_name == "word" && (
                                                                                <span
                                                                                    className={fontType() == "IndoPak" ? "font-arabic-indopak" : classUtsmani}
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
                                                                                    className={fontType() == "IndoPak" ? "font-arabic-indopak" : classUtsmani}
                                                                                    onClick={() => handleClick('verse', verse?.id || 1)}
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
                        <div className="text-gray-700">Tidak ada data ayat untuk ditampilkan.</div>
                    )}
                </div>
            );
        }
    }


    if (!surah || !verses || !errorLabels || !fontType()) {
        return <div>Data tidak tersedia.</div>;
    }

    return (
        <AppWrapper>
            <Head title={`${surah.name_simple} - Recap`} />
            <QuranHeader page={1} translateMode="read" target="/result" errorLabels={validateErrorLabels()} onUpdateErrorLabels={setCurrentErrorLabels} setting={setting} />
            <div className="mx-auto max-w-7xl overflow-auto p-4">
                {/* <ErrorDetails errorLabels={validateErrorLabels()} recordErrors={mistake} /> */}
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
                <div className="mt-20 mb-12 text-center">
                    <p className={`text-lg text-gray-700 dark:text-gray-300`}>
                        {surah.name_simple} ({surah.id}) <Info className='ml-3 w-3.5 lg:w-5 inline text-blue-400 cursor-pointer' onClick={() => { handelInfoChapter(surah.id) }} />
                    </p>
                    {surah.bismillah_pre && (
                        <p className={`${fontType() == "IndoPak" ? "font-arabic-indopak" : "font-arabic"} mt-6 text-4xl dark:text-gray-300`} style={{ direction: 'rtl' }}>
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                        </p>
                    )}
                </div>
                <div
                    className={`pb-[100px] md:pb-0`}
                    style={{
                        direction: 'rtl',
                        textAlign: 'justify',
                        textJustify: 'inter-word',
                        lineHeight: '2',
                        position: "relative",
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
