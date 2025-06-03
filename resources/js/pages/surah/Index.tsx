import AppWrapper from '@/components/layouts/app-wrapper';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import MistakeModal from '../../components/layouts/mistakeModal';

interface Word {
    id: number;
    position: number;
    text_uthmani: string;
    char_type_name: string;
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

interface Surah {
    id: number;
    revelation_place: string;
    bismillah_pre: boolean | null;
    name_simple: string;
    name_arabic: string;
    verses_count: number;
    translated_name: { name: string; language_name: string };
}

interface PageProps {
    surah: Surah;
    verses: Verse[];
}

export default function SurahIndex() {
    const { surah, verses } = usePage<PageProps>().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
    const [selectedVerseId, setSelectedVerseId] = useState<number | null>(null);
    const [selectedWordText, setSelectedWordText] = useState<string | null>(null);
    const [wordColors, setWordColors] = useState<{ [key: number]: string }>({});
    const [verseColors, setVerseColors] = useState<{ [key: number]: string }>({});
    const [isRemoveMode, setIsRemoveMode] = useState(false);

    // Check if verses is empty
    useEffect(() => {
        if (verses.length === 0) {
            setModalOpen(true);
        }
    }, [verses]);

    // Handle click on word or verse
    const handleClick = (type: 'word' | 'verse', id: number) => {
        if (type === 'word') {
            setSelectedWordId(id);
            setSelectedVerseId(null);
            // Find the selected word's text_uthmani
            const word = verses.flatMap((v) => v.words).find((w) => w.id === id);
            setSelectedWordText(word ? word.text_uthmani : null);
            setIsRemoveMode(!!wordColors[id]);
        } else {
            setSelectedVerseId(id);
            setSelectedWordId(null);
            setSelectedWordText(null); // Clear word text for verse selection
            const verse = verses.find((v) => v.id === id);
            const isLabeled = verse && verse.words.some((word) => wordColors[word.id]);
            setIsRemoveMode(!!isLabeled || !!verseColors[id]);
        }
        setModalOpen(true);
    };

    // Handle label selection
    const handleLabelSelect = (color: string) => {
        if (selectedWordId !== null) {
            setWordColors((prev) => ({ ...prev, [selectedWordId]: color }));
        } else if (selectedVerseId !== null) {
            const verse = verses.find((v) => v.id === selectedVerseId);
            if (verse) {
                const newWordColors = { ...wordColors };
                verse.words.forEach((word) => {
                    newWordColors[word.id] = color;
                });
                setWordColors(newWordColors);
                setVerseColors((prev) => ({ ...prev, [selectedVerseId]: color }));
            }
        }
        setModalOpen(false);
        setSelectedWordId(null);
        setSelectedVerseId(null);
        setSelectedWordText(null);
        setIsRemoveMode(false);
    };

    // Handle remove label
    const handleRemoveLabel = () => {
        if (selectedWordId !== null) {
            setWordColors((prev) => {
                const newColors = { ...prev };
                delete newColors[selectedWordId];
                return newColors;
            });
        } else if (selectedVerseId !== null) {
            const verse = verses.find((v) => v.id === selectedVerseId);
            if (verse) {
                const newWordColors = { ...wordColors };
                verse.words.forEach((word) => {
                    delete newWordColors[word.id];
                });
                setWordColors(newWordColors);
                setVerseColors((prev) => {
                    const newColors = { ...prev };
                    delete newColors[selectedVerseId];
                    return newColors;
                });
            }
        }
        setModalOpen(false);
        setSelectedWordId(null);
        setSelectedVerseId(null);
        setSelectedWordText(null);
        setIsRemoveMode(false);
    };

    // Group verses by page_number for separators
    const groupedVerses = verses.reduce((acc, verse, index) => {
        const page = verse.page_number;
        if (!acc[page]) {
            acc[page] = [];
        }
        acc[page].push({ verse, index });
        return acc;
    }, {} as { [key: number]: { verse: Verse; index: number }[] });

    return (
        <AppWrapper>
            <Head title="Page" />
            <div className="mx-auto max-w-3xl p-4 overflow-auto mt-15">
                <MistakeModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedWordId(null);
                        setSelectedVerseId(null);
                        setSelectedWordText(null);
                        setIsRemoveMode(false);
                    }}
                    onLabelSelect={handleLabelSelect}
                    onRemoveLabel={handleRemoveLabel}
                    versesEmpty={verses.length === 0}
                    isRemoveMode={isRemoveMode}
                    selectedWordId={selectedWordId}
                    selectedVerseId={selectedVerseId}
                    selectedWordText={selectedWordText}
                    wordColors={wordColors}
                    verseColors={verseColors}
                />
                {/* Surah Header */}
                <div className="mb-12 text-center">
                    <h1 className="font-arabic text-4xl font-bold text-gray-800">{surah.name_arabic}</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        {surah.name_simple} ({surah.id})
                    </p>
                    {surah.bismillah_pre && (
                        <p className="font-arabic mt-6 text-5xl text-gray-800" style={{ direction: 'rtl' }}>
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                        </p>
                    )}
                </div>

                {/* Verses Text (Inline, like Quran) */}
                <div className="font-arabic text-right text-3xl leading-loose text-gray-800" style={{ direction: 'rtl' }}>
                    {verses.map((verse, index) => (
                        <span key={verse.id}>
                            {verse.words.map((word) => (
                                <span
                                    key={word.id}
                                    className="cursor-pointer transition-colors duration-200 hover:text-blue-300 inline-block px-1"
                                    style={{
                                        backgroundColor: wordColors[word.id] || 'transparent',
                                        lineHeight: '1.5em',
                                        verticalAlign: 'middle',
                                    }}
                                    onClick={() => handleClick('word', word.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleClick('word', word.id);
                                        }
                                    }}
                                >
                                    {word.text_uthmani}{' '}
                                </span>
                            ))}
                            <span
                                className="font-arabic inline-flex items-center justify-center text-3xl text-gray-700 cursor-pointer transition-colors duration-200 hover:text-blue-300 px-1"
                                style={{
                                    backgroundColor: verseColors[verse.id] || 'transparent',
                                    lineHeight: '1.5em',
                                    verticalAlign: 'middle',
                                    minWidth: '2em',
                                    textAlign: 'center',
                                }}
                                onClick={() => handleClick('verse', verse.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleClick('verse', verse.id);
                                    }
                                }}
                            >
                                ۝{verse.end_marker || verse.verse_number}
                            </span>
                            {/* Add page separator if this is the last verse on the page */}
                            {groupedVerses[verse.page_number][groupedVerses[verse.page_number].length - 1].verse.id ===
                                verse.id && (
                                <div className="my-4 flex items-center">
                                    <hr className="flex-1 border-t border-gray-300" />
                                    <span className="mx-4 text-sm font-medium text-gray-600">
                                        Page {verse.page_number}
                                    </span>
                                    <hr className="flex-1 border-t border-gray-300" />
                                </div>
                            )}
                            {index < verses.length - 1 && ' '}
                        </span>
                    ))}
                </div>
            </div>
        </AppWrapper>
    );
}
