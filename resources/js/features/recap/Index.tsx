import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import React, { Component, useEffect, useState } from 'react';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
                        <p className="text-sm text-gray-600">Please try again or contact support.</p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

interface Reciter {
    user_id: string;
    user_name: string;
    full_name: string;
}

interface Surah {
    id: string;
    name: string;
    from: string;
    to: string;
}

interface SalahAyat {
    salahKey: string;
    NamaSurah: string;
    noAyat: number;
    salah: string;
}

interface SalahKata {
    salahKey: string;
    kata: { text: string };
    salah: string;
}

// Updated interface to match actual data structure
interface MistakeItem {
    halaman: string;
    kesimpulan: string | null;
    catatan: string | null;
    salah_ayat: SalahAyat[]; // Changed from salahAyat to salah_ayat
    salah_kata: SalahKata[]; // Changed from salahKata to salah_kata
}

interface SetoranData {
    reciter: Reciter;
    recipient: string;
    setoran_type: string;
    surah_id: string;
    surah: Surah;
    mistake: MistakeItem[]; // Changed from object to array
    conclusion: string;
    ket: string;
}

interface VerseOption {
    value: string;
    label: string;
}

const t = (key: string): string => {
    const translations: { [key: string]: string } = {
        'general.hasilrekap': 'Hasil Setoran',
        'rekapan.form.peserta': 'Peserta',
        'rekapan.form.awal_surah': 'Awal Surah',
        'rekapan.form.awal_ayat': 'Awal Ayat',
        'rekapan.form.akhir_surah': 'Akhir Surah',
        'rekapan.form.akhir_ayat': 'Akhir Ayat',
        'rekapan.form.kesimpulan': 'Kesimpulan',
        'rekapan.form.pilih_kesimpulan': 'Pilih Kesimpulan',
        'rekapan.form.catatan': 'Catatan',
        'rekapan.form.catatan_khusus': 'Catatan Khusus',
        'rekapan.form.kesalahan_ayat': 'Kesalahan Ayat',
        'rekapan.form.tidak_ada_kesalahan_ayat': 'Tidak Ada Kesalahan Ayat',
        'rekapan.form.kesalahan_kata': 'Kesalahan Kata',
        'rekapan.form.tidak_ada_kesalahan_kata': 'Tidak Ada Kesalahan Kata',
        'rekapan.kesimpulan_options.Excellent': 'Excellent',
        'rekapan.kesimpulan_options.Very Good': 'Very Good',
        'rekapan.kesimpulan_options.Good': 'Good',
        'rekapan.kesimpulan_options.Pass': 'Pass',
        'rekapan.kesimpulan_options.Weak': 'Weak',
        'rekapan.kesimpulan_options.Not Pass': 'Not Pass',
        'rekapan.form.halaman': 'Halaman',
        'rekapan.form.setoran_type': 'Jenis Setoran',
    };
    return translations[key] || key;
};

const DisabledRecapFormLayout: React.FC = () => {
    const [panels, setPanels] = useState<{ [key: string]: boolean }>({});
    const [setoranData, setSetoranData] = useState<SetoranData | null>(null);

    useEffect(() => {
        try {
            const storedData = localStorage.getItem('setoran-data');
            if (storedData) {
                const parsedData: SetoranData = JSON.parse(storedData);

                // Validate and normalize the data structure
                if (parsedData.mistake && Array.isArray(parsedData.mistake)) {
                    // Data is already in correct format, just ensure all fields exist
                    const normalizedMistakes = parsedData.mistake.map((item) => ({
                        halaman: item.halaman || '',
                        kesimpulan: item.kesimpulan || '',
                        catatan: item.catatan || '',
                        salah_ayat: Array.isArray(item.salah_ayat) ? item.salah_ayat : [],
                        salah_kata: Array.isArray(item.salah_kata) ? item.salah_kata : [],
                    }));

                    setSetoranData({ ...parsedData, mistake: normalizedMistakes });

                    // Initialize panels state
                    const initialPanels: { [key: string]: boolean } = {};
                    normalizedMistakes.forEach((item) => {
                        initialPanels[item.halaman] = true;
                    });
                    setPanels(initialPanels);
                } else {
                    console.error('Invalid mistake data structure');
                    setSetoranData(null);
                }
            } else {
                setSetoranData(null);
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            setSetoranData(null);
        }
    }, []);

    const generateVerseOptions = (parsedData: SetoranData | null): VerseOption[] => {
        if (!parsedData?.surah) return [];

        const from = parseInt(parsedData.surah.from, 10);
        const to = parseInt(parsedData.surah.to, 10);
        const options: VerseOption[] = [];

        for (let i = from; i <= to; i++) {
            options.push({ value: i.toString(), label: `Ayat ${i}` });
        }
        return options;
    };

    const togglePanel = (page: string): void => {
        setPanels((prev) => ({ ...prev, [page]: !prev[page] }));
    };

    const getErrorColor = (salahKey: string): string => {
        return salahKey?.includes('tajweed') ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200';
    };

    const getErrorTextColor = (salahKey: string): string => {
        return salahKey?.includes('tajweed') ? 'text-red-700' : 'text-orange-700';
    };

    const getSurahName = (parsedData: SetoranData | null): string => {
        return parsedData?.surah?.name || 'Unknown Surah';
    };

    if (!setoranData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-600">Loading data...</p>
                </div>
            </div>
        );
    }

    const verseOptions: VerseOption[] = generateVerseOptions(setoranData);
    const surahName: string = getSurahName(setoranData);

    const handleSubmit = () => {
        window.location.href = `/recap/surah/${setoranData.surah.id}`;
    };
    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50 py-6 pt-20">
                <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">{/* <h1 className="mb-1 text-2xl font-bold text-gray-900">{t('general.hasilrekap')}</h1> */}</div>

                    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-4 grid grid-cols-1 gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.peserta')}</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                                    value={setoranData.reciter?.full_name || ''}
                                    disabled
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.awal_surah')}</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                                        value={surahName}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.awal_ayat')}</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                                        value={setoranData.surah?.from || ''}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.akhir_surah')}</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                                        value={surahName}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.akhir_ayat')}</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                                        value={setoranData.surah?.to || ''}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.kesimpulan')}</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                                    value={setoranData.conclusion || ''}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.catatan')}</label>
                            <textarea
                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                                rows={3}
                                value={setoranData.ket || ''}
                                disabled
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="rounded-md bg-[rgb(94,114,228)] px-4 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-[rgb(57,69,138)] disabled:cursor-not-allowed disabled:bg-blue-300"
                            >
                                Lebih Lengkap
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {(setoranData.mistake || [])
                            .sort((a, b) => parseInt(a.halaman) - parseInt(b.halaman))
                            .map((mistakeItem) => (
                                <div key={mistakeItem.halaman} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                                    <div
                                        className="flex cursor-pointer items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 hover:bg-blue-100"
                                        onClick={() => togglePanel(mistakeItem.halaman)}
                                    >
                                        <div className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4 text-blue-600" />
                                            <h3 className="text-base font-medium text-gray-900">
                                                {`${surahName} - ${t('rekapan.form.halaman')} ${mistakeItem.halaman}`}
                                            </h3>
                                            <div className="ml-3 flex items-center space-x-2">
                                                {(mistakeItem.salah_ayat || []).length > 0 && (
                                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                                        {(mistakeItem.salah_ayat || []).length} ayat
                                                    </span>
                                                )}
                                                {(mistakeItem.salah_kata || []).length > 0 && (
                                                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                                                        {(mistakeItem.salah_kata || []).length} kata
                                                    </span>
                                                )}
                                                {(mistakeItem.salah_ayat || []).length === 0 && (mistakeItem.salah_kata || []).length === 0 && (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        Perfect
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {panels[mistakeItem.halaman] ? (
                                            <ChevronUp className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        )}
                                    </div>

                                    {panels[mistakeItem.halaman] && (
                                        <div className="space-y-4 p-4">
                                            {/* Kesalahan Ayat Section */}
                                            <div>
                                                <div className="mb-3 flex items-center">
                                                    <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                                                    <h4 className="text-base font-medium text-gray-900">{t('rekapan.form.kesalahan_ayat')}</h4>
                                                </div>
                                                {(mistakeItem.salah_ayat || []).length === 0 ? (
                                                    <div className="rounded-md border border-green-200 bg-green-50 p-3">
                                                        <p className="flex items-center text-sm text-green-700">
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                            {t('rekapan.form.tidak_ada_kesalahan_ayat')}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {(mistakeItem.salah_ayat || []).map((err, idx) => (
                                                            <div
                                                                key={`verse-${idx}`}
                                                                className={`rounded-md border p-3 ${getErrorColor(err.salahKey)}`}
                                                            >
                                                                <div className="flex items-start">
                                                                    <span className="mt-0.5 mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-gray-600">
                                                                        {idx + 1}
                                                                    </span>
                                                                    <div className="flex-1">
                                                                        <div className="mb-1 flex items-center">
                                                                            <span
                                                                                className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${getErrorTextColor(
                                                                                    err.salahKey,
                                                                                )} border bg-white`}
                                                                            >
                                                                                {err.NamaSurah} : {err.noAyat}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm text-gray-700">{err.salah}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Kesalahan Kata Section */}
                                            <div>
                                                <div className="mb-3 flex items-center">
                                                    <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
                                                    <h4 className="text-base font-medium text-gray-900">{t('rekapan.form.kesalahan_kata')}</h4>
                                                </div>
                                                {(mistakeItem.salah_kata || []).length === 0 ? (
                                                    <div className="rounded-md border border-green-200 bg-green-50 p-3">
                                                        <p className="flex items-center text-sm text-green-700">
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                            {t('rekapan.form.tidak_ada_kesalahan_kata')}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {(mistakeItem.salah_kata || []).map((err, idx) => (
                                                            <div
                                                                key={`word-${idx}`}
                                                                className={`rounded-md border p-3 ${getErrorColor(err.salahKey)}`}
                                                            >
                                                                <div className="flex items-start">
                                                                    <span className="mt-0.5 mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-gray-600">
                                                                        {idx + 1}
                                                                    </span>
                                                                    <div className="flex flex-1 items-center">
                                                                        {' '}
                                                                        {/* Tambahkan flex dan items-center di sini */}
                                                                        <div className="mr-3">
                                                                            {' '}
                                                                            {/* Tambahkan margin kanan untuk spasi */}
                                                                            <span
                                                                                className={`inline-block rounded-md border bg-white px-2 py-1 text-base ${getErrorTextColor(
                                                                                    err.salahKey,
                                                                                )}`}
                                                                                style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                                                                            >
                                                                                {err.kata?.text || ''}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-sm text-gray-700">{err.salah}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Summary Section */}
                                            <div className="border-t border-gray-200 pt-4">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="mb-1 block text-xs font-medium text-gray-700">
                                                            {t('rekapan.form.kesimpulan')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                                                            value={mistakeItem.kesimpulan || ''}
                                                            disabled
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-xs font-medium text-gray-700">
                                                            {t('rekapan.form.catatan')}
                                                        </label>
                                                        <textarea
                                                            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                                                            rows={2}
                                                            value={mistakeItem.catatan || ''}
                                                            disabled
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default DisabledRecapFormLayout;
