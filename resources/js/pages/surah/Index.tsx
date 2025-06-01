import { usePage } from '@inertiajs/react';

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

  return (
    <div className="container mx-auto p-4 max-w-3xl">
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
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
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
                className="hover:bg-yellow-200 transition-colors duration-200"
              >
                {word.text_uthmani}{' '}
              </span>
            ))}
            <span className="inline-flex items-center justify-center text-xl font-arabic text-gray-700">
              {/* ۝{verse.end_marker || verse.verse_number}۝ */}
                 ۝{verse.end_marker || verse.verse_number}
            </span>
            {index < verses.length - 1 && ' '}
          </span>
        ))}
      </div>
    </div>
  );
}
