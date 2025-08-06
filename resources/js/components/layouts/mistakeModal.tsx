// File: mistakeModal.tsx
import { X } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';

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
    onLabelSelect?: (key: string) => void;
    onRemoveLabel?: () => void;
    errorLabels: ErrorLabel[];
    versesEmpty?: boolean;
    selectedWordId?: number | null;
    selectedVerseId?: number | null;
    selectedWordText?: string | null;
    wordErrors?: { [key: number]: string };
    verseErrors?: { [key: number]: string };
}

// const errorLabels: ErrorLabel[] = [
//     { id: 1, key: 'sa-1', value: 'Ayat Lupa', color: '#CCCCCC', status: 1 },
//     { id: 2, key: 'sa-2', value: 'Ayat Waqaf atau Washal', color: '#99CCFF', status: 1 },
//     { id: 3, key: 'sa-3', value: 'Ayat Waqaf dan Ibtida', color: '#DFF18F', status: 1 },
//     { id: 4, key: 'sa-4', value: 'Ayat Tertukar', color: '#F4ACB6', status: 1 },
//     { id: 5, key: 'sa-5', value: 'Lainnya(Global)', color: '#FA7656', status: 1 },
//     { id: 6, key: 'sk-1', value: 'Gharib', color: '#FFCC99', status: 1 },
//     { id: 7, key: 'sk-2', value: 'Ghunnah', color: '#F4A384', status: 1 },
//     { id: 8, key: 'sk-3', value: 'Harakat tertukar', color: '#F8DD74', status: 1 },
//     { id: 9, key: 'sk-4', value: 'Huruf Tambah Kurang', color: '#FA7656', status: 1 },
//     { id: 10, key: 'sk-5', value: 'Lupa', color: '#B5C9DF', status: 1 },
//     { id: 11, key: 'sk-6', value: 'Mad', color: '#FE7D8F', status: 1 },
//     { id: 12, key: 'sk-7', value: 'Makhroj', color: '#A1D4CF', status: 1 },
//     { id: 13, key: 'sk-8', value: 'Nun Mati Tanwin', color: '#90CBAA', status: 1 },
//     { id: 14, key: 'sk-9', value: 'Qalqalah', color: '#FA7656', status: 1 },
//     { id: 15, key: 'sk-10', value: 'Tasydid', color: '#FE7D8F', status: 1 },
//     { id: 16, key: 'sk-11', value: 'Urutan Huruf / Kata', color: '#90CBAA', status: 1 },
//     { id: 17, key: 'sk-12', value: 'Waqof Washal', color: '#F8DD74', status: 1 },
//     { id: 18, key: 'sk-13', value: 'Waqaf Ibtida', color: '#CC99CC', status: 1 },
//     { id: 19, key: 'sk-14', value: 'Lainnya', color: '#CCCCCC', status: 1 },
// ];

const MistakeModal: FC<MistakeModalProps> = ({
    isOpen,
    onClose,
    onLabelSelect,
    onRemoveLabel,
    errorLabels,
    versesEmpty,
    selectedWordId,
    selectedVerseId,
    selectedWordText,
    wordErrors,
    verseErrors,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Jika modal terbuka dan klik bukan di dalam modal
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Tambahkan event listener saat modal terbuka
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Hapus event listener saat komponen unmount atau modal tertutup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;
    const displayedLabels = selectedVerseId ? errorLabels.filter((label) => label.id <= 5) : errorLabels.filter((label) => label.id > 5 && label.key.startsWith('sk-'));
    const currentErrorKey =
        selectedWordId && wordErrors ? wordErrors[selectedWordId] : selectedVerseId && verseErrors ? verseErrors[selectedVerseId] : null;
    const modalSize = selectedVerseId ? 'max-w-xs min-h-[15vh] h-[370px]' : 'md:max-w-md max-w-xs md:h-[520px] h-[550px]';
    const labelListHeight = selectedVerseId ? 'min-h-48' : 'max-h-95';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className={`relative rounded-2xl bg-white p-4 ${modalSize} w-full   overflow-y-auto border border-gray-200 shadow-2xl dark:bg-[rgb(38,45,52)] dark:border-gray-600`} ref={modalRef}>
                {/* Tombol X */}

                {versesEmpty ? (
                    <p className="mb-4 text-center text-gray-600">Tidak ada ayat yang ditemukan untuk Surah ini.</p>
                ) : (
                    <>
                        <div className="relative mb-4 flex items-center justify-between rounded-md bg-transparent p-2 ">
                            <h2 className="font-arabic text-center text-xl font-bold text-gray-800 dark:text-white">
                                {selectedVerseId ? 'Kesalahan Ayat' : 'Kesalahan Kata'}
                                {selectedWordText && (
                                    <span className="font-arabic mr-2 ml-2 text-xl text-gray-800 dark:text-white" style={{ direction: 'rtl' }}>
                                        {selectedWordText}
                                    </span>
                                )}
                            </h2>
                            <button onClick={onClose} className="justify-self-end text-gray-600 hover:text-gray-900 cursor-pointer" title="Tutup">
                                <X size={20} />
                            </button>
                        </div>

                        <div className={`grid grid-cols-2 gap-2 ${labelListHeight} `}>
                            {displayedLabels.map((label) => {
                                if (!label.status) return;
                                return (
                                    <div
                                        key={label.id}
                                        className={`hover:bg-opacity-80 cursor-pointer rounded px-3 py-2 text-gray-800 transition-colors duration-200 ${currentErrorKey === label.key ? 'border-2 border-blue-500' : ''}`}
                                        style={{ backgroundColor: label.color }}
                                        onClick={() => onLabelSelect?.(label.key)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                onLabelSelect?.(label.key);
                                            }
                                        }}
                                    >
                                        {label.value}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-8 md:mt-3 flex justify-center gap-2">
                            {currentErrorKey && (
                                <button
                                    onClick={onRemoveLabel}
                                    className="rounded bg-red-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-600"
                                >
                                    Hapus Tanda
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MistakeModal;
