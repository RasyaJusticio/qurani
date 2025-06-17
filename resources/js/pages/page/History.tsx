import AppWrapper from '@/components/layouts/app-wrapper';
import RecapHeader from '@/components/layouts/recap-header';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';

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
  [key: string]: unknown; // Add index signature to satisfy Inertia's PageProps constraint
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

export default function PageRecap() {
  const { page, verses, chapters } = usePage<PageProps>().props;
  const [popupError, setPopupError] = useState<{
    type: 'word' | 'verse';
    id: number;
    label: (typeof errorLabels)[0];
    locationText: string;
  } | null>(null);
  const [wordErrors, setWordErrors] = useState<{ [key: number]: string }>({});
  const [verseErrors, setVerseErrors] = useState<{ [key: number]: string }>({});
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const spanRefs = useRef<{ [key: string]: HTMLSpanElement }>({});

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
    label: (typeof errorLabels)[0] | undefined,
    locationText: string,
    event: React.MouseEvent<HTMLSpanElement>,
  ) => {
    if (label) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltip({
        visible: true,
        text: label.value,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const versesBySurah: { [key: number]: Verse[] } = {};
  verses.forEach((verse) => {
    const surahId = parseInt(verse.verse_key.split(':')[0]);
    if (!versesBySurah[surahId]) {
      versesBySurah[surahId] = [];
    }
    versesBySurah[surahId].push(verse);
  });

  const groupedVerses = verses.reduce(
    (acc, verse, index) => {
      const pageNum = verse.page_number;
      if (!acc[pageNum]) {
        acc[pageNum] = [];
      }
      acc[pageNum].push({ verse, index });
      return acc;
    },
    {} as { [key: number]: { verse: Verse; index: number }[] },
  );

  return (
    <AppWrapper>
      <Head title={`Page ${page.page_number} - Recap`} />
      <RecapHeader page={1} translateMode="read" classNav="ms-3" target="/result/page" />
      <div className="mx-auto max-w-4xl overflow-auto p-4">
        <div className="mt-20 mb-12">
          {Object.keys(versesBySurah).map((surahId) => {
            const surah = chapters[parseInt(surahId)];
            return (
              <div key={surahId} className="mb-8">
                <div className="text-center">
                  <h2 className="font-arabic text-3xl font-bold text-gray-800">{surah.name_arabic}</h2>
                  <p className="mt-2 text-lg text-gray-600">
                    {surah.translated_name.name} ({surah.name_simple})
                  </p>
                  {surah.bismillah_pre && (
                    <p className="font-arabic mt-4 text-4xl text-gray-800" style={{ direction: 'rtl' }}>
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                    </p>
                  )}
                </div>
                <div
                  className="font-arabic text-3xl text-gray-800"
                  style={{
                    direction: 'rtl',
                    textAlign: 'justify',
                    textJustify: 'inter-word',
                    lineHeight: '2',
                    wordSpacing: '0.05em',
                    letterSpacing: '0.03em',
                  }}
                >
                  {versesBySurah[parseInt(surahId)].map((verse, index) => {
                    const verseLabel = verseErrors[verse.id]
                      ? errorLabels.find((l) => l.key === verseErrors[verse.id])
                      : null;
                    return (
                      <span
                        key={verse.id}
                        style={{ backgroundColor: verseLabel?.color || 'transparent' }}
                        ref={(el) => {
                          if (el) spanRefs.current[`verse-${verse.id}`] = el;
                        }}
                      >
                        {verse.words.map((word) => {
                          const errorLabel = wordErrors[word.id]
                            ? errorLabels.find((l) => l.key === wordErrors[word.id])
                            : null;
                          return (
                            <span
                              key={word.id}
                              className="cursor-pointer transition-colors duration-200 hover:text-blue-300 relative"
                              style={{
                                backgroundColor: errorLabel?.color || 'transparent',
                                display: 'inline',
                              }}
                              ref={(el) => {
                                if (el) spanRefs.current[`word-${word.id}`] = el;
                              }}
                              onClick={
                                errorLabel
                                  ? () =>
                                      setPopupError({
                                        type: 'word',
                                        id: word.id,
                                        label: errorLabel,
                                        locationText: word.text_uthmani,
                                      })
                                  : undefined
                              }
                              onMouseEnter={(e) =>
                                handleMouseEnter('word', word.id, errorLabel, word.text_uthmani, e)
                              }
                              onMouseLeave={handleMouseLeave}
                            >
                              {word.text_uthmani}{' '}
                            </span>
                          );
                        })}
                        <span
                          className="cursor-pointer transition-colors duration-200 hover:text-blue-300 relative"
                          style={{
                            backgroundColor: verseLabel?.color || 'transparent',
                            display: 'inline',
                          }}
                          ref={(el) => {
                            if (el) spanRefs.current[`verse-end-${verse.id}`] = el;
                          }}
                          onClick={
                            verseLabel
                              ? () =>
                                  setPopupError({
                                    type: 'verse',
                                    id: verse.id,
                                    label: verseLabel,
                                    locationText: `Ayat ke-${verse.verse_number}`,
                                  })
                              : undefined
                          }
                          onMouseEnter={(e) =>
                            handleMouseEnter('verse', verse.id, verseLabel, `Ayat ke-${verse.verse_number}`, e)
                          }
                          onMouseLeave={handleMouseLeave}
                        >
                          ۝{verse.end_marker || verse.verse_number}
                        </span>
                        {groupedVerses[verse.page_number][groupedVerses[verse.page_number].length - 1].verse.id ===
                          verse.id && (
                          <div className="my-4 flex items-center">
                            <hr className="flex-1 border-t border-gray-300" />
                            <span className="mx-4 text-sm font-medium text-gray-600">Page {verse.page_number}</span>
                            <hr className="flex-1 border-t border-gray-300" />
                          </div>
                        )}
                        {index < versesBySurah[parseInt(surahId)].length - 1 && ' '}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {popupError && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/55">
            <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
              <p className="mb-2 text-2xl">
                <strong>{popupError.locationText}</strong>
              </p>
              <p className="mb-4">
                <span className="rounded px-2 py-1">{popupError.label.value}</span>
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
  );
}
