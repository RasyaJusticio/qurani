import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import MistakeModal from '../../components/layouts/mistakeModal';
import AppWrapper from '@/components/layouts/app-wrapper';

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

interface Juz {
  id: number;
  juz_number: number;
  pages: number[];
  verses_count: number;
}

interface PageProps {
  juz: Juz;
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

export default function JuzIndex() {
  const { juz, verses, chapters } = usePage<PageProps>().props;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [selectedVerseId, setSelectedVerseId] = useState<number | null>(null);
  const [wordErrors, setWordErrors] = useState<{ [key: number]: string }>({});
  const [verseErrors, setVerseErrors] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (verses.length === 0) {
      setModalOpen(true);
    }
  }, [verses]);

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
    }
    localStorage.setItem('setoran-data', JSON.stringify(dataToSave));
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

  return (
    <AppWrapper>
      <Head title="Juz" />
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
        <div className="font-arabic text-right text-3xl leading-loose text-gray-800">
          {verses.map((verse, index) => {
            const surahId = parseInt(verse.verse_key.split(':')[0]);
            const prevVerse = index > 0 ? verses[index - 1] : null;
            const isNewSurah = !prevVerse || surahId !== parseInt(prevVerse.verse_key.split(':')[0]);
            return (
              <>
                {isNewSurah && (
                  <div key={`surah-${surahId}`} className="mb-6 text-center">
                    <h2 className="font-arabic text-3xl font-bold text-gray-800">{chapters[surahId].name_arabic}</h2>
                    <p className="mt-2 text-lg text-gray-600">
                      {chapters[surahId].translated_name.name} ({chapters[surahId].name_simple})
                    </p>
                    {chapters[surahId].bismillah_pre && (
                      <p className="font-arabic mt-4 text-3xl text-gray-800">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                    )}
                  </div>
                )}
                <span key={verse.id}>
                  {verse.words.map((word) => (
                    <span
                      key={word.id}
                      className="transition-colors duration-200 hover:text-blue-300 cursor-pointer"
                      style={{ backgroundColor: wordErrors[word.id] ? errorLabels.find((label) => label.key === wordErrors[word.id])?.color || 'transparent' : 'transparent' }}
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
                    className="font-arabic inline-flex items-center justify-center text-xl text-gray-700 cursor-pointer"
                    style={{ backgroundColor: verseErrors[verse.id] ? errorLabels.find((label) => label.key === verseErrors[verse.id])?.color || 'transparent' : 'transparent' }}
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
                </span>
                {index < verses.length - 1 && verses[index + 1].page_number !== verse.page_number && (
                  <div className="my-4 flex items-center">
                    <hr className="flex-1 border-t border-gray-300" />
                    <span className="mx-4 text-sm font-medium text-gray-600">Page {verse.page_number}</span>
                    <hr className="flex-1 border-t border-gray-300" />
                  </div>
                )}
              </>
            );
          })}
        </div>
      </div>
    </AppWrapper>
  );
}
