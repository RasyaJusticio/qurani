import { ClipboardList, X } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

// Define types for our data structures
type ErrorDefinition = {
    id: number;
    key: string;
    value: string;
    color: string;
    status: number;
};

type PageErrors = {
    salahAyat: Array<{
        salahKey: string;
        NamaSurat: string;
        noAyat: number;
        salah: string;
    }>;
    salahKata: Array<{
        salahKey: string;
        kata: { text: string };
        word_location: string;
        salah: string;
    }>;
};

type RecordedErrors = {
    [page: string]: PageErrors;
};

interface ErrorDetailsProps {
    errorLabels: ErrorDefinition[];
    recordErrors: RecordedErrors;
}

const ErrorDetails: React.FC<ErrorDetailsProps> = ({ errorLabels, recordErrors }) => {
    const [show, setShow] = useState(false);
    const contentElement = useRef<HTMLButtonElement>(null);
    const [currentPageSet, setCurrentPageSet] = useState(0);
    const itemsPerPage = 30; // Jumlah item per halaman

    // Data definisi kesalahan (dari `qu_setting_global`)
    const errorDefinitions: ErrorDefinition[] = errorLabels || [];
    // const errorDefinitions: ErrorDefinition[] = [
    //     { id: 1, key: 'sa-1', value: 'Ayat Lupa', color: '#CCCCCC', type: 'ayat' },
    //     { id: 2, key: 'sa-2', value: 'Ayat Waqaf atau Washal', color: '#99CCFF', type: 'ayat' },
    //     { id: 3, key: 'sa-3', value: 'Ayat Waqaf dan Ibtida', color: '#DFF18F', type: 'ayat' },
    //     { id: 4, key: 'sa-4', value: 'Ayat Tertukar', color: '#F4ACB6', type: 'ayat' },
    //     { id: 5, key: 'sa-5', value: 'Lainnya(Global)', color: '#FA7656', type: 'ayat' },
    //     { id: 6, key: 'sk-1', value: 'Gharib', color: '#FFCC99', type: 'kata' },
    //     { id: 7, key: 'sk-2', value: 'Ghunnah', color: '#F4A384', type: 'kata' },
    //     { id: 8, key: 'sk-3', value: 'Harakat tertukar', color: '#F8DD74', type: 'kata' },
    //     { id: 9, key: 'sk-4', value: 'Huruf Tambah Kurang', color: '#FA7656', type: 'kata' },
    //     { id: 10, key: 'sk-5', value: 'Lupa', color: '#B5C9DF', type: 'kata' },
    //     { id: 11, key: 'sk-6', value: 'Mad', color: '#FE7D8F', type: 'kata' },
    //     { id: 12, key: 'sk-7', value: 'Makhroj', color: '#A1D4CF', type: 'kata' },
    //     { id: 13, key: 'sk-8', value: 'Nun Mati Tanwin', color: '#90CBAA', type: 'kata' },
    //     { id: 14, key: 'sk-9', value: 'Qalqalah', color: '#FA7656', type: 'kata' },
    //     { id: 15, key: 'sk-10', value: 'Tasydid', color: '#FE7D8F', type: 'kata' },
    //     { id: 16, key: 'sk-11', value: 'Urutan Huruf / Kata', color: '#90CBAA', type: 'kata' },
    //     { id: 17, key: 'sk-12', value: 'Waqof Washal', color: '#F8DD74', type: 'kata' },
    //     { id: 18, key: 'sk-13', value: 'Waqaf Ibtida', color: '#CC99CC', type: 'kata' },
    //     { id: 19, key: 'sk-14', value: 'Lainnya', color: '#CCCCCC', type: 'kata' }
    // ];

    // Data kesalahan hafalan yang dicatat (contoh data)
    const recordedErrors: RecordedErrors = {
        ...recordErrors // Use the passed in recorded errors
    };
    // const recordedErrors: RecordedErrors = {
    //     '440': {
    //         salahAyat: [
    //             {
    //                 NamaSurat: 'Ya-Sin',
    //                 noAyat: 5,
    //                 salah: 'Ayat Waqaf atau Washal',
    //                 salahKey: 'sa-2'
    //             }
    //         ],
    //         salahKata: [
    //             {
    //                 kata: { text: 'فِىٓ' },
    //                 salah: 'Nun Mati Tanwin',
    //                 salahKey: 'sk-8',
    //                 word_location: '36:8:3'
    //             }
    //         ]
    //     },
    // };
    // const recordedErrors: RecordedErrors = {
    //     '440': {
    //         salahAyat: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 7, salah: 'Ayat Waqaf dan Ibtida', salahKey: 'sa-3' }
    //         ],
    //         salahKata: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'وَٱلْقُرْءَانِ' }, salah: 'Mad', salahKey: 'sk-6', word_location: '36:2:1' },
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'ٱلْحَكِيمِ' }, salah: 'Huruf Tambah Kurang', salahKey: 'sk-4', word_location: '36:2:2' }
    //         ]
    //     },
    //     '441': {
    //         salahAyat: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 7, salah: 'Ayat Waqaf dan Ibtida', salahKey: 'sa-3' }
    //         ],
    //         salahKata: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'وَٱلْقُرْءَانِ' }, salah: 'Mad', salahKey: 'sk-6', word_location: '36:2:1' },
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'ٱلْحَكِيمِ' }, salah: 'Huruf Tambah Kurang', salahKey: 'sk-4', word_location: '36:2:2' }
    //         ]
    //     },
    //     '442': {
    //         salahAyat: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 7, salah: 'Ayat Waqaf dan Ibtida', salahKey: 'sa-3' }
    //         ],
    //         salahKata: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'وَٱلْقُرْءَانِ' }, salah: 'Mad', salahKey: 'sk-6', word_location: '36:2:1' },
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'ٱلْحَكِيمِ' }, salah: 'Huruf Tambah Kurang', salahKey: 'sk-4', word_location: '36:2:2' }
    //         ]
    //     },
    //     '443': {
    //         salahAyat: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 7, salah: 'Ayat Waqaf dan Ibtida', salahKey: 'sa-3' }
    //         ],
    //         salahKata: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'وَٱلْقُرْءَانِ' }, salah: 'Mad', salahKey: 'sk-6', word_location: '36:2:1' },
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'ٱلْحَكِيمِ' }, salah: 'Huruf Tambah Kurang', salahKey: 'sk-4', word_location: '36:2:2' }
    //         ]
    //     },
    //     '444': {
    //         salahAyat: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 7, salah: 'Ayat Waqaf dan Ibtida', salahKey: 'sa-3' }
    //         ],
    //         salahKata: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'وَٱلْقُرْءَانِ' }, salah: 'Mad', salahKey: 'sk-6', word_location: '36:2:1' },
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'ٱلْحَكِيمِ' }, salah: 'Huruf Tambah Kurang', salahKey: 'sk-4', word_location: '36:2:2' }
    //         ]
    //     },
    //     '445': {
    //         salahAyat: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 7, salah: 'Ayat Waqaf dan Ibtida', salahKey: 'sa-3' }
    //         ],
    //         salahKata: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'وَٱلْقُرْءَانِ' }, salah: 'Mad', salahKey: 'sk-6', word_location: '36:2:1' },
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'ٱلْحَكِيمِ' }, salah: 'Huruf Tambah Kurang', salahKey: 'sk-4', word_location: '36:2:2' }
    //         ]
    //     },
    //     '446': {
    //         salahAyat: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 7, salah: 'Ayat Waqaf dan Ibtida', salahKey: 'sa-3' }
    //         ],
    //         salahKata: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'وَٱلْقُرْءَانِ' }, salah: 'Mad', salahKey: 'sk-6', word_location: '36:2:1' },
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'ٱلْحَكِيمِ' }, salah: 'Huruf Tambah Kurang', salahKey: 'sk-4', word_location: '36:2:2' }
    //         ]
    //     },
    //     '447': {
    //         salahAyat: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 7, salah: 'Ayat Waqaf dan Ibtida', salahKey: 'sa-3' }
    //         ],
    //         salahKata: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'وَٱلْقُرْءَانِ' }, salah: 'Mad', salahKey: 'sk-6', word_location: '36:2:1' },
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'ٱلْحَكِيمِ' }, salah: 'Huruf Tambah Kurang', salahKey: 'sk-4', word_location: '36:2:2' }
    //         ]
    //     },
    //     '448': {
    //         salahAyat: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 7, salah: 'Ayat Waqaf dan Ibtida', salahKey: 'sa-3' }
    //         ],
    //         salahKata: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'وَٱلْقُرْءَانِ' }, salah: 'Mad', salahKey: 'sk-6', word_location: '36:2:1' },
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'ٱلْحَكِيمِ' }, salah: 'Huruf Tambah Kurang', salahKey: 'sk-4', word_location: '36:2:2' }
    //         ]
    //     },
    //     '449': {
    //         salahAyat: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 7, salah: 'Ayat Waqaf dan Ibtida', salahKey: 'sa-3' }
    //         ],
    //         salahKata: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'وَٱلْقُرْءَانِ' }, salah: 'Mad', salahKey: 'sk-6', word_location: '36:2:1' },
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'ٱلْحَكِيمِ' }, salah: 'Huruf Tambah Kurang', salahKey: 'sk-4', word_location: '36:2:2' }
    //         ]
    //     },
    //     '450': {
    //         salahAyat: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 7, salah: 'Ayat Waqaf dan Ibtida', salahKey: 'sa-3' }
    //         ],
    //         salahKata: [
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'وَٱلْقُرْءَانِ' }, salah: 'Mad', salahKey: 'sk-6', word_location: '36:2:1' },
    //             { NamaSurat: 'Ya-Sin', noAyat: 2, kata: { text: 'ٱلْحَكِيمِ' }, salah: 'Huruf Tambah Kurang', salahKey: 'sk-4', word_location: '36:2:2' }
    //         ]
    //     },
    //     '62': {
    //         salahAyat: [], // Contoh: tidak ada kesalahan ayat di halaman ini
    //         salahKata: [
    //             { NamaSurat: 'An-Nisa', noAyat: 1, kata: { text: 'الناس' }, salah: 'Lupa', salahKey: 'sk-5' },
    //             { NamaSurat: 'An-Nisa', noAyat: 2, kata: { text: 'وَٱلْقُرْءَانِ' }, salah: 'Ghunnah', salahKey: 'sk-2' }
    //         ]
    //     },
    //     '1': { salahAyat: [], salahKata: [] }, // Halaman 1 tanpa kesalahan
    //     '2': { salahAyat: [], salahKata: [] }, // Halaman 2 tanpa kesalahan
    //     '3': {
    //         salahAyat: [],
    //         salahKata: [
    //             { NamaSurat: 'Ali-Imran', noAyat: 10, kata: { text: 'غَيْرِ' }, salah: 'Gharib', salahKey: 'sk-1' }
    //         ]
    //     }
    // };

    const [currentSelectedPage, setCurrentSelectedPage] = useState<string | null>(null);

    // Fungsi untuk mendapatkan warna teks kontras (hitam atau putih)
    const getContrastColor = (hexcolor: string): string => {
        // Jika warna adalah #FA7656, gunakan teks putih
        if (hexcolor.toUpperCase() === '#FA7656') {
            return '#FFFFFF';
        }

        // Hapus '#' jika ada
        hexcolor = hexcolor.replace(/^#/, '');

        // Konversi hex ke nilai RGB
        const r = parseInt(hexcolor.substr(0, 2), 16);
        const g = parseInt(hexcolor.substr(2, 2), 16);
        const b = parseInt(hexcolor.substr(4, 2), 16);

        // Hitung luminansi
        const y = (r * 299 + g * 587 + b * 114) / 1000;

        // Kembalikan hitam untuk warna terang, putih untuk warna gelap
        return y >= 128 ? '#334155' : '#FFFFFF';
    };

    // Filter halaman yang memiliki salahAyat atau salahKata
    const pagesWithError = Object.keys(recordedErrors).filter(pageNumber =>
        (recordedErrors[pageNumber].salahAyat && recordedErrors[pageNumber].salahAyat.length > 0) ||
        (recordedErrors[pageNumber].salahKata && recordedErrors[pageNumber].salahKata.length > 0)
    ).sort((a, b) => parseInt(a) - parseInt(b));

    const pageSets = Math.ceil(pagesWithError.length / itemsPerPage);
    const displayedPages = pagesWithError.slice(
        currentPageSet * itemsPerPage,
        (currentPageSet + 1) * itemsPerPage
    );

    // Pilih halaman pertama dengan kesalahan secara default saat komponen dimount
    useEffect(() => {
        if (pagesWithError.length > 0 && currentSelectedPage === null) {
            setCurrentSelectedPage(pagesWithError[0]);
        }

        // Scroll ke atas saat konten berubah
        if (contentElement.current) {
            contentElement.current.scrollIntoView({ behavior: 'smooth' });
        }
        // Tambahkan event listener untuk menangani klik di luar konten
        const handleClickOutside = (event: MouseEvent) => {
            if (contentElement.current && !contentElement.current.contains(event.target as Node)) {
                setShow(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectPage = (pageNumber: string) => {
        setCurrentSelectedPage(pageNumber);
    };

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [show])

    const renderCurrentPageDetails = () => {
        if (!currentSelectedPage || !recordedErrors[currentSelectedPage]) {
            return (
                <p className="text-gray-500 text-center py-8">
                    Pilih halaman untuk melihat detail kesalahan
                </p>
            );
        }

        const pageErrors = recordedErrors[currentSelectedPage];

        if (pageErrors.salahAyat.length === 0 && pageErrors.salahKata.length === 0) {
            return (
                <p className="text-gray-500 text-center py-8">
                    Tidak ada kesalahan yang dicatat pada halaman ini.
                </p>
            );
        }

        return (
            <div>
                {/* Render Kesalahan Ayat section */}
                {pageErrors.salahAyat.length > 0 && (
                    <div>
                        <h3 className="text-[1rem] font-bold text-gray-800 mt-6 mb-4 pb-2 border-b-2 border-gray-100">
                            Kesalahan Ayat
                        </h3>
                        <ul className="space-y-4">
                            {pageErrors.salahAyat.map((errorEntry, index) => {
                                const errorDef = errorDefinitions.find(def => def.key === errorEntry.salahKey);
                                if (!errorDef) return null;

                                return (
                                    <li key={`ayat-${index}`} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                        <span className="text-[1rem] font-semibold text-gray-700 mb-2 sm:mb-0">
                                            {errorEntry.NamaSurat}: {errorEntry.noAyat}
                                        </span>
                                        <span
                                            className="font-bold px-4 py-2 rounded-lg text-xs inline-block whitespace-nowrap shadow-sm"
                                            style={{
                                                backgroundColor: errorDef.color,
                                                color: getContrastColor(errorDef.color)
                                            }}
                                        >
                                            {errorEntry.salah}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {/* Render Kesalahan Kata section */}
                {pageErrors.salahKata.length > 0 && (
                    <div>
                        <h3 className="text-[1rem] font-bold text-gray-800 mt-6 mb-4 pb-2 border-b-2 border-gray-100">
                            Kesalahan Kata
                        </h3>
                        <ul className="space-y-4">
                            {pageErrors.salahKata.map((errorEntry, index) => {
                                const errorDef = errorDefinitions.find(def => def.key === errorEntry.salahKey);
                                if (!errorDef) return null;

                                return (
                                    <li key={`kata-${index}`} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                        <span className="text-[1rem] font-semibold text-gray-700 mb-2 sm:mb-0">
                                            {/* {errorEntry.NamaSurat || ''}: {errorEntry.noAyat || ''} - Kata Salah:{' '} */}
                                            <span className="font-bold text-xl">{errorEntry.kata?.text || '-'}</span>
                                        </span>
                                        <span
                                            className="font-bold px-4 py-2 rounded-lg text-xs inline-block whitespace-nowrap shadow-sm"
                                            style={{
                                                backgroundColor: errorDef.color,
                                                color: getContrastColor(errorDef.color)
                                            }}
                                        >
                                            {errorEntry.salah}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <div className="hidden sm:block fixed right-10 bottom-10 z-40">
                <button
                    className="relative cursor-pointer w-16 h-16 flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                    aria-label="Daftar Kesalahan Hafalan"
                    onClick={() => {
                        console.log('Daftar Kesalahan Hafalan clicked');
                        setShow(true);
                    }}
                >
                    {/* Overlay untuk memastikan area klik penuh */}
                    <span className="absolute inset-0 w-full h-full" aria-hidden="true"></span>
                    <ClipboardList
                        size={32}
                        className="text-white relative z-10 pointer-events-none"
                    />
                </button>
            </div>

            <div className={`fixed z-50 inset-0 bg-black/50  items-center justify-center min-h-screen w-full ${show ? 'flex' : 'hidden'}`}>
                <div className="rounded-2xl bg-gray-100 flex flex-col items-center justify-start py-8 px-4 sm:px-8 font-sans h-[90%] w-full pb-[100px] sm:pb-10 sm:w-[60%] overflow-y-auto" ref={contentElement}>
                    <div className="w-full max-w-4xl">
                        <h1 className="text-2xl sm:text-xl font-extrabold text-center text-gray-900 mb-4 relative">
                            Daftar Kesalahan Hafalan
                            <span className='absolute top-0 right-0 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors' onClick={() => setShow(false)}>
                                <X />
                            </span>
                        </h1>

                        {/* Halaman dengan Kesalahan Section (Navigation) */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-2 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-lg font-semibold text-gray-700">Halaman Kesalahan</span>
                            </div>
                            {/* <div>
                                {pagesWithError.length > 0 ? (
                                    <div className="flex flex-wrap justify-center gap-1 mt-4 py-6 bg-blue-500 rounded-xl border border-blue-600 shadow-inner px-3">
                                        {pagesWithError.map(pageNumber => (
                                            <button
                                                key={pageNumber}
                                                className={`text-blue-700 text-xs font-semibold px-2 py-1 rounded-full cursor-pointer transition-all duration-300 ease-in-out ${currentSelectedPage === pageNumber
                                                    ? 'bg-gradient-to-r from-blue-800 to-blue-800 text-white font-bold shadow-md border-blue-700 '
                                                    : 'bg-white border border-blue-200 hover:bg-blue-100 hover:shadow-md hover:-translate-y-1'
                                                    }`}
                                                onClick={() => selectPage(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-white text-lg font-semibold mt-4 text-center bg-blue-500 rounded-xl py-6 px-4">
                                        Tidak ada kesalahan yang dicatat pada halaman manapun. MasyaAllah!
                                    </p>
                                )}
                            </div> */}
                            {/* <div className="flex flex-wrap justify-center gap-2 mt-4 py-6 bg-blue-500 rounded-xl border border-blue-600 shadow-inner px-3">
                                {pagesWithError.length > 0 ? (
                                    <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-2 w-full">
                                        {pagesWithError.map(pageNumber => (
                                            <button
                                                key={pageNumber}
                                                className={`
                                                         text-blue-700 text-sm font-semibold px-2 py-1 sm:px-3 sm:py-2
                                                         rounded-full cursor-pointer transition-all duration-300 ease-in-out
                                                         ${currentSelectedPage === pageNumber
                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-md border-blue-700 transform -translate-y-1'
                                                        : 'bg-white border border-blue-200 hover:bg-blue-100 hover:shadow-md hover:-translate-y-1'
                                                    }
                                                       flex items-center justify-center
                                                     `}
                                                onClick={() => selectPage(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-white text-lg font-semibold mt-4 text-center bg-blue-500 rounded-xl py-6 px-4">
                                        Tidak ada kesalahan yang dicatat pada halaman manapun. MasyaAllah!
                                    </p>
                                )}
                            </div> */}
                            <div className="flex flex-wrap justify-center gap-2 mt-4 py-6 bg-blue-500 rounded-xl border border-blue-600 shadow-inner px-3">
                                {pagesWithError.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-2 w-full">
                                            {displayedPages.map(pageNumber => (
                                                <button
                                                    key={pageNumber}
                                                    className={`
              text-blue-700 text-sm font-semibold px-2 py-1 sm:px-3 sm:py-2
              rounded-full cursor-pointer transition-all duration-300 ease-in-out
              ${currentSelectedPage === pageNumber
                                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-md border-blue-700 transform -translate-y-1'
                                                            : 'bg-white border border-blue-200 hover:bg-blue-100 hover:shadow-md hover:-translate-y-1'
                                                        }
              flex items-center justify-center
            `}
                                                    onClick={() => selectPage(pageNumber)}
                                                >
                                                    {pageNumber}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Pagination Controls */}
                                        {pageSets > 1 && (
                                            <div className="flex justify-center mt-4 gap-2 w-full">
                                                <button
                                                    onClick={() => setCurrentPageSet(prev => Math.max(prev - 1, 0))}
                                                    disabled={currentPageSet === 0}
                                                    className="cursor-pointer px-3 py-1 bg-white rounded-md disabled:opacity-50"
                                                >
                                                    Sebelumnya
                                                </button>

                                                <span className="px-3 py-1 bg-white rounded-md">
                                                    Halaman {currentPageSet + 1} dari {pageSets}
                                                </span>

                                                <button
                                                    onClick={() => setCurrentPageSet(prev => Math.min(prev + 1, pageSets - 1))}
                                                    disabled={currentPageSet === pageSets - 1}
                                                    className="cursor-pointer px-3 py-1 bg-white rounded-md disabled:opacity-50"
                                                >
                                                    Berikutnya
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-white text-lg font-semibold mt-4 text-center bg-blue-500 rounded-xl py-6 px-4">
                                        Tidak ada kesalahan yang dicatat pada halaman manapun. MasyaAllah!
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Section for the currently selected Quran Page with errors */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <h2 className="text-lg font-extrabold text-center text-gray-900 mb-6">
                                {currentSelectedPage ? `Halaman ${currentSelectedPage}` : 'Pilih halaman untuk melihat detail kesalahan'}
                            </h2>
                            <div>
                                {renderCurrentPageDetails()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorDetails;
