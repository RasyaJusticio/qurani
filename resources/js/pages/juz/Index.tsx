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

interface Juz {
  id: number;
  juz_number: number;
  pages: number[];
  verses_count: number;
}

interface PageProps {
  juz: Juz;
  verses: Verse[];
}

export default function JuzIndex() {
  const { juz, verses } = usePage<PageProps>().props;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      {/* Juz Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 font-arabic">
          الجزء {juz.juz_number}
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Juz {juz.juz_number} | {juz.verses_count} Ayat | Halaman {juz.pages[0]}–{juz.pages[1]}
        </p>
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
              ۝{verse.end_marker || verse.verse_number}
            </span>
            {index < verses.length - 1 && ' '}
          </span>
        ))}
      </div>
    </div>
  );
}
