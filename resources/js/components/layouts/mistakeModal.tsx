import { FC } from 'react';

interface ErrorLabel {
  id: number;
  key: string;
  value: string;
  color: string;
  status: number;
}

interface MistakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLabelSelect?: (color: string) => void;
  onRemoveLabel?: () => void;
  versesEmpty?: boolean;
  isRemoveMode?: boolean;
  selectedWordId?: number | null;
  selectedVerseId?: number | null;
  selectedWordText?: string | null;
  wordColors?: { [key: number]: string };
  verseColors?: { [key: number]: string };
}

const errorLabels: ErrorLabel[] = [
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

const MistakeModal: FC<MistakeModalProps> = ({
  isOpen,
  onClose,
  onLabelSelect,
  onRemoveLabel,
  versesEmpty,
  isRemoveMode,
  selectedWordId,
  selectedVerseId,
  selectedWordText,
  wordColors,
  verseColors,
}) => {
  if (!isOpen) return null;

  // Filter labels: show labels with id <= 5 for verses, id > 5 for words
  const displayedLabels = selectedVerseId ? errorLabels.filter(label => label.id <= 5) : errorLabels.filter(label => label.id > 5);

  // Find the current label for the selected word or verse
  const currentLabel = selectedWordId && wordColors
    ? errorLabels.find(label => label.color === wordColors[selectedWordId])
    : selectedVerseId && verseColors
    ? errorLabels.find(label => label.color === verseColors[selectedVerseId])
    : null;

  // Set modal size: smaller width and height for verses, larger for words
  const modalSize = selectedVerseId ? 'max-w-xs min-h-[15vh]' : 'max-w-sm min-h-[20vh]';
  // Set label list height: shorter for verses, taller for words
  const labelListHeight = selectedVerseId ? 'min-h-48' : 'max-h-95';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-2xl p-6 ${modalSize} w-full overflow-y-auto shadow-2xl border border-gray-200`}>
        {/* Mode konfirmasi hapus */}
        {isRemoveMode ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Konfirmasi Hapus Tanda
            </h2>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={onRemoveLabel}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
              >
                Ya, Hapus
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors duration-200"
              >
                Batal
              </button>
            </div>
          </>
        ) : (
          /* Mode pilih label atau verses empty */
          <>
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 text-center font-arabic">
                {versesEmpty ? 'إشعار' : selectedVerseId ? 'Kesalahan Ayat' : ``}
              </h2>
              {selectedWordText && (
                <span className="font-arabic text-xl text-gray-800 mr-2" style={{ direction: 'rtl' }}>
                  {selectedWordText}
                </span>
              )}
            </div>
            {versesEmpty ? (
              <p className="text-gray-600 mb-4 text-center">
                Tidak ada ayat yang ditemukan untuk Surah ini.
              </p>
            ) : (
              <div className={`flex flex-col gap-2 ${labelListHeight} overflow-y-auto`}>
                {displayedLabels.map((label) => (
                  <div
                    key={label.id}
                    className="px-3 py-2 rounded cursor-pointer hover:bg-opacity-80 transition-colors duration-200 text-gray-800"
                    style={{ backgroundColor: label.color }}
                    onClick={() => onLabelSelect?.(label.color)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onLabelSelect?.(label.color);
                      }
                    }}
                  >
                    {label.value}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center mt-4">
              <button
                onClick={onClose}
                className="px-3 py-1 bg-blue-300 text-white rounded hover:bg-blue-400 transition-colors duration-200"
              >
                Tutup
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MistakeModal;
