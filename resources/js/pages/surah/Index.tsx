import { Head, usePage } from '@inertiajs/react';
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
  const [wordColors, setWordColors] = useState<{ [key: number]: string }>({});
  const [isRemoveMode, setIsRemoveMode] = useState(false);

  // Check if verses is empty
  useEffect(() => {
    if (verses.length === 0) {
      setModalOpen(true);
    }
  }, [verses]);

  // Handle word click
  const handleWordClick = (word: Word) => {
    setSelectedWordId(word.id);

    // Cek apakah word sudah ada labelnya
    const hasLabel = wordColors[word.id] && wordColors[word.id] !== 'transparent';

    if (hasLabel) {
      // Jika sudah ada label, tampilkan modal konfirmasi hapus
      setIsRemoveMode(true);
    } else {
      // Jika belum ada label, tampilkan modal pilih label
      setIsRemoveMode(false);
    }

    setModalOpen(true);
  };

  // Handle label selection
  const handleLabelSelect = (color: string) => {
    if (selectedWordId !== null) {
      setWordColors((prev) => ({ ...prev, [selectedWordId]: color }));
    }
    setModalOpen(false);
    setSelectedWordId(null);
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
    }
    setModalOpen(false);
    setSelectedWordId(null);
    setIsRemoveMode(false);
  };

  return (
    <>    <Head title='Page'/>
    <div className="container mx-auto p-4 max-w-3xl">
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
      {/* Surah Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 font-arabic">
          {surah.name_arabic}
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          {surah.translated_name.name} ({surah.name_simple}) | {surah.verses_count} Ayat |{' '}
          {surah.revelation_place.charAt(0).toUpperCase() + surah.revelation_place.slice(1)}
        </p>
        {surah.bismillah_pre && (
          <p className="text-3xl mt-6 font-arabic text-gray-800">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        )}
      </div>

      {/* Verses Text (Inline, like Quran) */}
      <div className="text-right text-3xl font-arabic text-gray-800 leading-loose">
        {verses.map((verse, index) => (
          <span key={verse.id}>
            {verse.words.map((word) => (
              <span
                key={word.id}
                className="hover:text-blue-300 transition-colors duration-200 cursor-pointer"
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
            <span className="inline-flex items-center justify-center text-xl font-arabic text-gray-700">
              ۝{verse.end_marker || verse.verse_number}
            </span>
            {index < verses.length - 1 && ' '}
          </span>
        ))}
      </div>
    </div>
    </>

  );
}
