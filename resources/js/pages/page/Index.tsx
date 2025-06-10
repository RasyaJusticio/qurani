import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import MistakeModal from '../../components/layouts/mistakeModal';
import AppWrapper from '@/components/layouts/app-wrapper';
import QuranHeader from '@/components/layouts/main-header';
import { Inertia } from '@inertiajs/inertia';
import PageHeader from '@/components/layouts/page-juz-header';

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

interface PageProps {
  page: Page;
  verses: Verse[];
  chapters: { [key: number]: Chapter };
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
    }>;
  };
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

export default function PageIndex() {
  const { page, verses, chapters } = usePage<PageProps>().props;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [selectedVerseId, setSelectedVerseId] = useState<number | null>(null);
  const [wordErrors, setWordErrors] = useState<{ [key: number]: string }>({});
  const [verseErrors, setVerseErrors] = useState<{ [key: number]: string }>({});

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

    const surahIds = Object.keys(versesBySurah).map(id => parseInt(id)).sort((a, b) => a - b);
    const firstSurahId = surahIds[0];
    const lastSurahId = surahIds[surahIds.length - 1];
    const firstVerse = versesBySurah[firstSurahId][0].verse_number;
    const lastVerse = versesBySurah[lastSurahId][versesBySurah[lastSurahId].length - 1].verse_number;

    const surahDetails = surahIds.map(id => ({
      id: id.toString(),
      name: chapters[id].name_simple,
      first_verse: versesBySurah[id][0].verse_number.toString(),
      last_verse: versesBySurah[id][versesBySurah[id].length - 1].verse_number.toString(),
    }));

    const existingData = localStorage.getItem('setoran-data');
    let parsedData = existingData ? JSON.parse(existingData) : { recipient: '', reciter: { user_name: '', full_name: '' } };
    let dataToSave = {
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

    localStorage.setItem('setoran-data', JSON.stringify(dataToSave));
  }, [verses, chapters, page]);

  useEffect(() => {
    const errorsByPage = generateErrorsByPage();
    const existingData = localStorage.getItem('setoran-data');
    let parsedData = existingData ? JSON.parse(existingData) : { recipient: '', reciter: { user_name: '', full_name: '' } };
    let dataToSave = {
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
  }, [wordErrors, verseErrors, page]);

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
        const errorLabel = errorLabels.find((label) => label.key === errorKey);
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
          const errorLabel = errorLabels.find((label) => label.key === errorKey);
          if (errorLabel) {
            errorsByPage[page].salahKata.push({
              salahKey: errorKey,
              kata: { text: word.text_uthmani },
              salah: errorLabel.value,
            });
          }
        }
      }
    });
    return errorsByPage;
  };

  const versesBySurah: { [key: number]: Verse[] } = {};
  verses.forEach((verse) => {
    const surahId = parseInt(verse.verse_key.split(':')[0]);
    if (!versesBySurah[surahId]) {
      versesBySurah[surahId] = [];
    }
    versesBySurah[surahId].push(verse);
  });

  return (
    <AppWrapper>
      <Head title="Page" />
      <PageHeader
        page={1}
        translateMode="read"
        classNav=""
        target='/result/page'
      />
      <div className="container mx-auto max-w-3xl p-4">
        <MistakeModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedWordId(null);
            setSelectedVerseId(null);
          }}
          onLabelSelect={handleLabelSelect}
          onRemoveLabel={handleRemoveLabel}
          versesEmpty={verses.length === 0}
          selectedWordId={selectedWordId}
          selectedVerseId={selectedVerseId}
          wordErrors={wordErrors}
          verseErrors={verseErrors}
        />
        <div className="font-arabic text-right text-3xl leading-loose text-gray-800 mt-20" style={{ direction: 'rtl' }}>
          {Object.keys(versesBySurah).map((surahId) => {
            const surah = chapters[parseInt(surahId)];
            return (
              <div key={surahId} className="mb-8">
                <div className="mb-6 text-center">
                  <h2 className="font-arabic text-3xl font-bold text-gray-800">{surah.name_arabic}</h2>
                  <p className="mt-2 text-lg text-gray-600">
                    {surah.translated_name.name} ({surah.name_simple})
                  </p>
                  {surah.bismillah_pre && (
                    <p className="font-arabic mt-4 text-3xl text-gray-800">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                  )}
                </div>
                <div className="font-arabic text-right text-3xl leading-loose text-gray-800">
                  {versesBySurah[parseInt(surahId)].map((verse, index) => (
                    <span
                      key={verse.id}
                      style={{
                        display: 'inline-block',
                        backgroundColor: verseErrors[verse.id]
                          ? errorLabels.find((label) => label.key === verseErrors[verse.id])?.color || 'transparent'
                          : 'transparent',
                        lineHeight: '1.5em',
                        verticalAlign: 'middle',
                      }}
                    >
                      {verse.words.map((word) => (
                        <span
                          key={word.id}
                          className="inline-block cursor-pointer px-1 transition-colors duration-200 hover:text-blue-300"
                          style={{
                            backgroundColor: wordErrors[word.id]
                              ? errorLabels.find((label) => label.key === wordErrors[word.id])?.color || 'transparent'
                              : 'transparent',
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
                        className="inline-block cursor-pointer px-1 transition-colors duration-200 hover:text-blue-300"
                        style={{
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
                      {index < versesBySurah[parseInt(surahId)].length - 1 && ' '}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppWrapper>
  );
}
