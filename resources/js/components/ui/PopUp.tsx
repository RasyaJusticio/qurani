import React, { useEffect } from 'react';

interface PopUpProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}

const PopUp: React.FC<PopUpProps> = ({ isOpen, onClose, onConfirm, message }) => {
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                // Tidak melakukan apa-apa, memaksa pengguna memilih
            }
        };

        if (isOpen) {
            // Mencegah klik di luar popup tanpa menyembunyikan scrollbar
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-white p-6 rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.1),_0_1px_3px_rgba(0,0,0,0.08),_0_-1px_3px_rgba(0,0,0,0.08),_-1px_0_3px_rgba(0,0,0,0.08),_1px_0_3px_rgba(0,0,0,0.08)] w-full max-w-md text-center transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fadeIn"
                onClick={(e) => e.stopPropagation()} // Mencegah klik pada popup menutupnya
            >
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <p className="text-gray-600 mb-4">{message}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Ya
                    </button>
                </div>
            </div>
        </div>
    );
};

// CSS Animasi
const styles = `
@keyframes fadeIn {
    from {
        transform: scale(0.95);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

.animate-fadeIn {
    animation: fadeIn 0.1s ease-out forwards;
}
`;

// Tambahkan style ke dokumen
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

export default PopUp;