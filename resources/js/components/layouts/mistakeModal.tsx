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
  wordColors?: { [key: number]: string };
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
  wordColors,
}) => {
  if (!isOpen) return null;

  // Cari label yang sedang aktif untuk word yang dipilih
  const currentLabelColor = selectedWordId && wordColors ? wordColors[selectedWordId] : null;
  const currentLabel = errorLabels.find(label => label.color === currentLabelColor);

  return (
    <div className="fixed inset-0 bg-transparent bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-sm w-full shadow-xl border">
        {/* Mode konfirmasi hapus */}
        {isRemoveMode ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Konfirmasi Hapus Label
            </h2>
            <div className="text-center mb-4">
              <p className="text-gray-600 mb-3">
                Apakah Anda yakin ingin menghapus label ini?
              </p>
              {currentLabel && (
                <div
                  className="inline-block px-3 py-2 rounded text-center font-medium"
                  style={{ backgroundColor: currentLabel.color }}
                >
                  {currentLabel.value}
                </div>
              )}
            </div>
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
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center font-arabic">
              {versesEmpty ? 'إشعار' : 'Pilih Label Kesalahan'}
            </h2>
            {versesEmpty ? (
              <p className="text-gray-600 mb-4 text-center">
                Tidak ada ayat yang ditemukan untuk Surah ini.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-700">
                      <th className="px-3 py-2">Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorLabels.map((label) => (
                      <tr
                        key={label.id}
                        className="cursor-pointer hover:bg-gray-100"
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
                        <td className="px-3 py-2">{label.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
