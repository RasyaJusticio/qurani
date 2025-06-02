import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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

export default function PageIndex() {
  const { page, verses, chapters } = usePage<PageProps>().props;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [wordColors, setWordColors] = useState<{ [key: number]: string }>({});
  const [isRemoveMode, setIsRemoveMode] = useState(false);

  useEffect(() => {
    if (verses.length === 0) {
      setModalOpen(true);
    }
  }, [verses]);

  const handleWordClick = (word: Word) => {
    setSelectedWordId(word.id);
    const hasLabel = wordColors[word.id] && wordColors[word.id] !== 'transparent';
    setIsRemoveMode(hasLabel);
    setModalOpen(true);
  };

  const handleLabelSelect = (color: string) => {
    if (selectedWordId !== null) {
      setWordColors((prev) => ({ ...prev, [selectedWordId]: color }));
    }
    setModalOpen(false);
    setSelectedWordId(null);
    setIsRemoveMode(false);
  };

  const handleRemoveLabel = () => {
    if (selectedWordId !== null) {
      setWordColors((prev) => {
        const newColors = { ...prev };
        delete newColors[selectedWordId];
        return newColors;
      });
    }
    setModalOpen(false);
    setSelectedWordId(null);
    setIsRemoveMode(false);
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
    <div className="container mx-auto max-w-3xl p-4">
      <MistakeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedWordId(null);
          setIsRemoveMode(false);
        }}
        onLabelSelect={handleLabelSelect}
        onRemoveLabel={handleRemoveLabel}
        versesEmpty={verses.length === 0}
        isRemoveMode={isRemoveMode}
        selectedWordId={selectedWordId}
        wordColors={wordColors}
      />
      <div className="font-arabic text-right text-3xl leading-loose text-gray-800">
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
                  <span key={verse.id}>
                    {verse.words.map((word) => (
                      <span
                        key={word.id}
                        className="transition-colors duration-200 hover:text-blue-300 cursor-pointer"
                        style={{ backgroundColor: wordColors[word.id] || 'transparent' }}
                        onClick={() => handleWordClick(word)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleWordClick(word);
                          }
                        }}
                      >
                        {word.text_uthmani}{' '}
                      </span>
                    ))}
                    <span className="font-arabic inline-flex items-center justify-center text-xl text-gray-700">
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
  );
}
