import AppWrapper from '@/components/layouts/app-wrapper';
import RecapHeader from '@/components/layouts/recap-header';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Word {
    id: number;
    position: number;
    text_uthmani: string;
    char_type_name: string;
    location: string;
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

const errorLabels = [
    { id: 1, key: 'sa-1', value: 'Ayat Lupa', color: '#CCCCCC', status: 1 },
    { id: 2, key: 'sa-2', value: 'Ayat Waqaf atau Washal', color: '#99CCFF', status: 1 },
    { id: 3, key: 'sa-3', value: 'Ayat Waqaf dan Ibtida', color: '#DFF18F', status: 1 },
    { id: 4, key: 'sa-4', value: 'Ayat Tertukar', color: '#F4ACB6', status: 1 },
    { id: 5, key: 'sa-5', value: 'Lainnya(Global)', color: '#FA7656', status: 1 },
    { id: 6, key: 'sk-1', value: 'Gharib', color: '#FFCC99', status: 1 },
    { id: 7, key: 'sk-2', value: 'Ghunnah', color: '#F4A384', status: 1 },
    { id: 8, key: 'sk-3', value: 'Harakat tertukar', color: '#F8DD74', status: 1 },
    { id: 9, key: 'sk-4', value: 'Huruf Tambah Kurang', color: '#FA7656', status: 1 },
    { id: 10, key: 'sk-5', value: 'Lupa', color: '#B5C9DF', status: 1 },
    { id: 11, key: 'sk-6', value: 'Mad', color: '#FE7D8F', status: 1 },
    { id: 12, key: 'sk-7', value: 'Makhroj', color: '#A1D4CF', status: 1 },
    { id: 13, key: 'sk-8', value: 'Nun Mati Tanwin', color: '#90CBAA', status: 1 },
    { id: 14, key: 'sk-9', value: 'Qalqalah', color: '#FA7656', status: 1 },
    { id: 15, key: 'sk-10', value: 'Tasydid', color: '#FE7D8F', status: 1 },
    { id: 16, key: 'sk-11', value: 'Urutan Huruf / Kata', color: '#90CBAA', status: 1 },
    { id: 17, key: 'sk-12', value: 'Waqof Washal', color: '#F8DD74', status: 1 },
    { id: 18, key: 'sk-13', value: 'Waqaf Ibtida', color: '#CC99CC', status: 1 },
    { id: 19, key: 'sk-14', value: 'Lainnya', color: '#CCCCCC', status: 1 },
];

export default function SurahIndex() {
    const { surah, verses } = usePage<PageProps>().props;
    const [wordErrors, setWordErrors] = useState<{ [key: number]: string }>({});
    const [verseErrors, setVerseErrors] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        const loadErrorsFromLocalStorage = () => {
            try {
                const existingData = localStorage.getItem('setoran-data');
                if (existingData) {
                    const data = JSON.parse(existingData);

                    if (data.mistake && typeof data.mistake === 'object') {
                        const newWordErrors: { [key: number]: string } = {};
                        const newVerseErrors: { [key: number]: string } = {};

                        Object.values(data.mistake).forEach((mistakeData: any) => {
                            // Corrected to salah_kata
                            if (mistakeData.salah_kata && Array.isArray(mistakeData.salah_kata)) {
                                mistakeData.salah_kata.forEach((wordError: any) => {
                                    const wordLocation = wordError.word_location;
                                    verses.forEach((verse) => {
                                        verse.words.forEach((word) => {
                                            if (word.location === wordLocation) {
                                                newWordErrors[word.id] = wordError.salahKey;
                                            }
                                        });
                                    });
                                });
                            }

                            // Corrected to salah_ayat
                            if (mistakeData.salah_ayat && Array.isArray(mistakeData.salah_ayat)) {
                                mistakeData.salah_ayat.forEach((verseError: any) => {
                                    const verseNumber = verseError.noAyat;
                                    const verse = verses.find((v) => v.verse_number === verseNumber);
                                    if (verse) {
                                        newVerseErrors[verse.id] = verseError.salahKey;
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

    return (
        <AppWrapper>
            <Head title={`${surah.name_simple} - Recap`} />
            <RecapHeader page={1} translateMode="read" classNav="ms-3" target="/result" />
            <div className="mx-auto max-w-3xl overflow-auto p-4">
                <div className="mt-20 mb-12 text-center">
                    <p className="text-lg text-gray-600">
                        {surah.name_simple} ({surah.id})
                    </p>
                    {surah.bismillah_pre && (
                        <p className="font-arabic mt-6 text-5xl text-gray-800" style={{ direction: 'rtl' }}>
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                        </p>
                    )}
                </div>
                <div className="font-arabic text-right text-3xl leading-loose text-gray-800" style={{ direction: 'rtl' }}>
                    {verses.map((verse, index) => (
                        <span key={verse.id}>
                            <span
                                style={{
                                    display: 'inline-block',
                                    backgroundColor: verseErrors[verse.id]
                                        ? errorLabels.find((label) => label.key === verseErrors[verse.id])?.color || 'transparent'
                                        : 'transparent',
                                    lineHeight: '1.5em',
                                    verticalAlign: 'middle',
                                }}
                            >
                                {verse.words.map((word) => {
                                    const errorLabel = wordErrors[word.id] ? errorLabels.find((label) => label.key === wordErrors[word.id]) : null;
                                    return (
                                        <span
                                            key={word.id}
                                            className="group relative inline-block px-1"
                                            style={{
                                                backgroundColor: errorLabel?.color || 'transparent',
                                                lineHeight: '1.5em',
                                                verticalAlign: 'middle',
                                            }}
                                            aria-label={errorLabel ? `Kesalahan: ${errorLabel.value}` : undefined}
                                        >
                                            {word.text_uthmani}{' '}
                                            {errorLabel && (
                                                <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 transform rounded-md bg-black px-2 py-1 text-xs text-white group-hover:block after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-black after:content-['']">
                                                    {errorLabel.value}
                                                </div>
                                            )}
                                        </span>
                                    );
                                })}
                                <span
                                    className="font-arabic group relative inline-flex items-center justify-center px-1 text-3xl text-gray-700"
                                    style={{
                                        lineHeight: '1.5em',
                                        verticalAlign: 'middle',
                                        minWidth: '2em',
                                        textAlign: 'center',
                                    }}
                                    aria-label={
                                        verseErrors[verse.id]
                                            ? `Kesalahan: ${errorLabels.find((label) => label.key === verseErrors[verse.id])?.value}`
                                            : undefined
                                    }
                                >
                                    ۝{verse.end_marker || verse.verse_number}
                                    {verseErrors[verse.id] && (
                                        <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 transform rounded-md bg-black px-2 py-1 text-xs text-white group-hover:block after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-black after:content-['']">
                                            {errorLabels.find((label) => label.key === verseErrors[verse.id])?.value}
                                        </div>
                                    )}
                                </span>
                            </span>
                            {groupedVerses[verse.page_number][groupedVerses[verse.page_number].length - 1].verse.id === verse.id && (
                                <div className="my-4 flex items-center">
                                    <hr className="flex-1 border-t border-gray-300" />
                                    <span className="mx-4 text-sm font-medium text-gray-600">Page {verse.page_number}</span>
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
