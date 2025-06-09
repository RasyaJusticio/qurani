import AppWrapper from '@/components/layouts/app-wrapper';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import MistakeModal from '../../components/layouts/mistakeModal';
import QuranHeader from '@/components/layouts/main-header';
import { Inertia } from '@inertiajs/inertia';

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
      salah: string;
    }>;
  };
};

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
  // Mock data - ganti dengan props asli
  const surah: Surah = {
    id: 36,
    revelation_place: "Mecca",
    bismillah_pre: true,
    name_simple: "Ya-Sin",
    name_arabic: "يس",
    verses_count: 83,
    translated_name: { name: "Ya-Sin", language_name: "English" }
  };

  const verses: Verse[] = [
    {
      id: 1,
      verse_number: 1,
      verse_key: "36:1",
      text_uthmani: "يس",
      page_number: 440,
      juz_number: 22,
      end_marker: "1",
      words: [
        { id: 1, position: 1, text_uthmani: "يس", char_type_name: "word" }
      ]
    },
    {
      id: 2,
      verse_number: 2,
      verse_key: "36:2",
      text_uthmani: "وَالْقُرْآنِ الْحَكِيمِ",
      page_number: 440,
      juz_number: 22,
      end_marker: "2",
      words: [
        { id: 2, position: 1, text_uthmani: "وَالْقُرْآنِ", char_type_name: "word" },
        { id: 3, position: 2, text_uthmani: "الْحَكِيمِ", char_type_name: "word" }
      ]
    },
    {
      id: 3,
      verse_number: 3,
      verse_key: "36:3",
      text_uthmani: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ",
      page_number: 440,
      juz_number: 22,
      end_marker: "3",
      words: [
        { id: 4, position: 1, text_uthmani: "إِنَّكَ", char_type_name: "word" },
        { id: 5, position: 2, text_uthmani: "لَمِنَ", char_type_name: "word" },
        { id: 6, position: 3, text_uthmani: "الْمُرْسَلِينَ", char_type_name: "word" }
      ]
    }
  ];

  const [wordErrors, setWordErrors] = useState<{ [key: number]: string }>({});
  const [verseErrors, setVerseErrors] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    // Load errors from localStorage
    const loadErrorsFromLocalStorage = () => {
      try {
        const existingData = localStorage.getItem('setoran-data');
        if (existingData) {
          const data = JSON.parse(existingData);

          if (data.mistake && Array.isArray(data.mistake)) {
            const newWordErrors: { [key: number]: string } = {};
            const newVerseErrors: { [key: number]: string } = {};

            data.mistake.forEach((mistakeData: any) => {
              // Process salah_kata
              if (mistakeData.salah_kata && Array.isArray(mistakeData.salah_kata)) {
                mistakeData.salah_kata.forEach((wordError: any) => {
                  const wordText = wordError.kata.text;
                  // Find word by text in verses
                  verses.forEach(verse => {
                    verse.words.forEach(word => {
                      if (word.text_uthmani === wordText) {
                        newWordErrors[word.id] = wordError.salahKey;
                      }
                    });
                  });
                });
              }

              // Process salah_ayat
              if (mistakeData.salah_ayat && Array.isArray(mistakeData.salah_ayat)) {
                mistakeData.salah_ayat.forEach((verseError: any) => {
                  const verseNumber = verseError.noAyat;
                  // Find verse by verse_number
                  const verse = verses.find(v => v.verse_number === verseNumber);
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
      <div>
        <title>Page</title>
      </div>
      <QuranHeader
        page={1}
        translateMode="read"
        classNav="ms-3"
        target='/result'
      />
      <div className="mx-auto max-w-3xl p-4 overflow-auto">
        <div className="mb-12 text-center mt-20">
          <p className="text-lg text-gray-600">
            {surah.name_simple} ({surah.id})
          </p>
          {surah.bismillah_pre && (
            <p className="font-arabic mt-6 text-5xl text-gray-800" style={{ direction: 'rtl' }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
          )}
        </div>
        <div className="font-arabic text-right text-3xl leading-loose text-gray-800" style={{ direction: 'rtl' }}>
          {verses.map((verse, index) => (
            <span key={verse.id}>
              {verse.words.map((word) => (
                <span
                  key={word.id}
                  className="inline-block px-1"
                  style={{
                    backgroundColor: wordErrors[word.id] ? errorLabels.find((label) => label.key === wordErrors[word.id])?.color || 'transparent' : 'transparent',
                    lineHeight: '1.5em',
                    verticalAlign: 'middle',
                  }}
                >
                  {word.text_uthmani}{' '}
                </span>
              ))}
              <span
                className="font-arabic inline-flex items-center justify-center text-3xl text-gray-700 px-1"
                style={{
                  backgroundColor: verseErrors[verse.id] ? errorLabels.find((label) => label.key === verseErrors[verse.id])?.color || 'transparent' : 'transparent',
                  lineHeight: '1.5em',
                  verticalAlign: 'middle',
                  minWidth: '2em',
                  textAlign: 'center',
                }}
              >
                ۝{verse.end_marker || verse.verse_number}
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
