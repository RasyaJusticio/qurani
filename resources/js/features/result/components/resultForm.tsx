import AppWrapper from '@/components/layouts/app-wrapper';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Updated Surah interface to match localStorage structure
interface Surah {
    id: string;
    name: string;
    first_verse?: string;
    last_verse?: string;
}

interface Reciter {
    user_name: string;
    full_name: string;
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

interface Mistake {
    [page: string]: {
        salahAyat: SalahAyat[];
        salahKata: SalahKata[];
        kesimpulan: string;
        catatan: string;
    };
}
interface PerhalamanItem {
  halaman: string;
  kesimpulan: string;
  catatan: string;
  salah_ayat: SalahAyat[];
  salah_kata: SalahKata[];
}

interface SetoranData {
    reciter: Reciter;
    penyetor: string; // Changed from reciter to match localStorage
    recipient: string;
    setoran: string;
    tampilan: string;
    surah: Surah[]; // Changed to array to match localStorage
    mistake: Mistake;
    display :string;
}

interface VerseOption {
    value: string;
    label: string;
}

interface FormData {
    reciter: Reciter | null;
    recipient: string;
    setoran: string;
    display: string;
    surah: Surah[] | null;
    mistake: Mistake;
    kesimpulan: string;
    catatan: string;
    awalAyat: string;
    akhirAyat: string;
    perhalaman: PerhalamanItem[];
    submit?: string; // Add this line to allow 'submit' as an error key
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
        'rekapan.form.mengirim': 'Mengirim...',
        'rekapan.form.kirim': 'Kirim',
        'rekapan.form.halaman': 'Halaman',
        'rekapan.form.setoran': 'Jenis Setoran',
    };
    return translations[key] || key;
};

const ResultFormLayout: React.FC = () => {
    const [panels, setPanels] = useState<{ [key: string]: boolean }>({});
    const [setoranData, setSetoranData] = useState<SetoranData | null>(null);

    const form = useForm<FormData>({
        reciter: null,
        recipient: '',
        setoran: '',
        display: '',
        surah: null,
        mistake: {},
        kesimpulan: '',
        catatan: '',
        awalAyat: '',
        akhirAyat: '',
    });

    useEffect(() => {
        try {
            const storedData = localStorage.getItem('setoran-data');
            const parsedData: SetoranData | null = storedData ? JSON.parse(storedData) : null;

            if (parsedData) {
                setSetoranData(parsedData);
                const transformedMistake: Mistake = {};
                Object.entries(parsedData.mistake).forEach(([page, data]) => {
                    transformedMistake[page] = {
                        ...data,
                        kesimpulan: '',
                        catatan: '',
                    };
                });

                // Extract first_verse and last_verse from the first surah in the array
                const firstSurah = parsedData.surah[0] || {};
                const awalAyat = firstSurah.first_verse || '';
                const akhirAyat = firstSurah.last_verse || '';

                form.setData({
                    reciter: {
                        user_name: parsedData.reciter.user_name,
                        full_name: parsedData.reciter.full_name,
                    },
                    recipient: parsedData.recipient,
                    setoran: parsedData.setoran,
                    display: parsedData.display,
                    surah: parsedData.surah,
                    mistake: transformedMistake,
                    awalAyat,
                    akhirAyat,
                    kesimpulan: '',
                    catatan: '',
                });

                if (parsedData.mistake) {
                    const initialPanels: { [key: string]: boolean } = {};
                    Object.keys(parsedData.mistake).forEach((key) => {
                        initialPanels[key] = true;
                    });
                    setPanels(initialPanels);
                }
            } else {
                setSetoranData(null);
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            setSetoranData(null);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const key = e.target.name || e.target.id;
        const value = e.target.value;
        form.setData(key as keyof FormData, value);
    };

    const handlePageChange = (page: string, field: 'kesimpulan' | 'catatan') => (
        e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const value = e.target.value;
        form.setData('mistake', {
            ...form.data.mistake,
            [page]: {
                ...form.data.mistake[page],
                [field]: value,
            },
        });
    };

    const generateVerseOptions = (parsedData: SetoranData | null): VerseOption[] => {
        if (!parsedData?.surah?.[0]) return [];

        const firstSurah = parsedData.surah[0];
        const from = parseInt(firstSurah.first_verse || '1', 10);
        const to = parseInt(firstSurah.last_verse || '1', 10);

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
        return salahKey.includes('tajweed') ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200';
    };

    const getErrorTextColor = (salahKey: string): string => {
        return salahKey.includes('tajweed') ? 'text-red-700' : 'text-orange-700';
    };

    const getSurahName = (parsedData: SetoranData | null): string => {
        return parsedData?.surah?.[0]?.name || 'Unknown Surah';
    };

    const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    form.clearErrors();

    // Validasi wajib
    if (!form.data.kesimpulan) form.setError('kesimpulan', 'Pilih kesimpulan');
    if (!form.data.awalAyat) form.setError('awalAyat', 'Pilih awal ayat');
    if (!form.data.akhirAyat) form.setError('akhirAyat', 'Pilih akhir ayat');
    if (!form.data.recipient) form.setError('recipient', 'Penerima wajib diisi');
    if (!form.data.setoran) form.setError('setoran', 'Jenis setoran wajib diisi');
    if (!form.data.display) form.setError('display', 'Tampilan wajib diisi');
    if (!form.data.surah || !form.data.surah.length) form.setError('surah', 'Surah wajib diisi');

    if (Object.keys(form.errors).length > 0) return;

    // Pastikan parseInt hanya dilakukan jika nilai ada
    const penerima = form.data.recipient ? parseInt(form.data.recipient) : 0;
    const nomor = form.data.surah && form.data.surah.length > 0 ? parseInt(form.data.surah[0].id) : 0;

    // Transformasi data perhalaman
    const perhalamanData = Object.entries(form.data.mistake).map(([page, data]) => ({
        halaman: page,
        kesimpulan: data.kesimpulan || '',
        catatan: data.catatan || '',
        salah_ayat: data.salahAyat || [],
        salah_kata: data.salahKata || [],
    }));

    const postData = {
        penyetor: form.data.reciter?.user_name || '',
        penerima,
        setoran: form.data.setoran,
        tampilan: form.data.display,
        nomor,
        info: `${form.data.awalAyat}-${form.data.akhirAyat}`,
        hasil: form.data.kesimpulan,
        ket: form.data.catatan,
        perhalaman: perhalamanData,
    };

    axios.post('/api/result', postData, {
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            Accept: 'application/json',
        },
    })
    .then((response) => {
        alert('Data berhasil dikirim!');
        // localStorage.removeItem('setoran-data');
        router.visit('/');
    })
    .catch((error) => {
        if (error.response && error.response.status === 422) {
            const errors = error.response.data.errors;
            Object.keys(errors).forEach((key) => {
    form.setError(key as keyof FormData, errors[key][0]);
});
        } else {
            console.error('Error:', error);
            form.setError('submit', 'Gagal mengirim data. Silakan coba lagi.');
        }
    });
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

    return (
        <AppWrapper>
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 text-center">
                        <h1 className="mb-1 text-1xl font-bold text-gray-900">{t('general.hasilrekap')}</h1>
                    </div>

                    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-4 grid grid-cols-1 gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.peserta')}</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-1 focus:ring-blue-500"
                                    value={form.data.reciter?.full_name || ''}
                                    disabled
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.awal_surah')}</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900"
                                        value={surahName}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.awal_ayat')}</label>
                                    <select
                                        name="awalAyat"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-1 focus:ring-blue-500"
                                        value={form.data.awalAyat}
                                        onChange={handleChange}
                                    >
                                        <option value="" className="text-sm text-gray-400">
                                            {t('rekapan.form.awal_ayat')}
                                        </option>
                                        {verseOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.awalAyat && <p className="mt-1 text-xs text-red-500">{form.errors.awalAyat}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.akhir_surah')}</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900"
                                        value={surahName}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.akhir_ayat')}</label>
                                    <select
                                        name="akhirAyat"
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-1 focus:ring-blue-500"
                                        value={form.data.akhirAyat}
                                        onChange={handleChange}
                                    >
                                        <option value="" className="text-sm text-gray-400">
                                            {t('rekapan.form.akhir_ayat')}
                                        </option>
                                        {verseOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {form.errors.akhirAyat && <p className="mt-1 text-xs text-red-500">{form.errors.akhirAyat}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.kesimpulan')}</label>
                                <select
                                    name="kesimpulan"
                                    className="w-50 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-1 focus:ring-blue-500"
                                    value={form.data.kesimpulan}
                                    onChange={handleChange}
                                >
                                    <option value="" className="text-sm text-gray-400">
                                        {t('rekapan.form.pilih_kesimpulan')}
                                    </option>
                                    {['Excellent', 'Very Good', 'Good', 'Pass', 'Weak', 'Not Pass'].map((option) => (
                                        <option key={option} value={option}>
                                            {t(`rekapan.kesimpulan_options.${option}`)}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.kesimpulan && <p className="mt-1 text-xs text-red-500">{form.errors.kesimpulan}</p>}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.catatan')}</label>
                            <textarea
                                name="catatan"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-1 focus:ring-blue-500"
                                rows={3}
                                placeholder={t('rekapan.form.catatan')}
                                value={form.data.catatan}
                                onChange={handleChange}
                            />
                            {form.errors.catatan && <p className="mt-1 text-xs text-red-500">{form.errors.catatan}</p>}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="rounded-md bg-[rgb(94,114,228)] px-4 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-[rgb(57,69,138)] disabled:cursor-not-allowed disabled:bg-blue-300"
                                disabled={form.processing}
                            >
                                {form.processing ? t('rekapan.form.mengirim') : t('rekapan.form.kirim')}
                            </button>
                        </div>
                        {form.errors.submit && <p className="mt-2 text-xs text-red-500">{form.errors.submit}</p>}
                    </div>

                    <div className="space-y-3">
                        {Object.entries(setoranData.mistake || {})
                            .sort(([pageA], [pageB]) => parseInt(pageA) - parseInt(pageB))
                            .map(([page, errors]) => (
                                <div key={page} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                                    <div
                                        className="flex cursor-pointer items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 hover:bg-blue-100"
                                        onClick={() => togglePanel(page)}
                                    >
                                        <div className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4 text-blue-600" />
                                            <h3 className="text-base font-medium text-gray-900">
                                                {`${surahName} - ${t('rekapan.form.halaman')} ${page}`}
                                            </h3>
                                            <div className="ml-3 flex items-center space-x-2">
                                                {form.data.mistake[page]?.salahAyat.length > 0 && (
                                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                                        {form.data.mistake[page].salahAyat.length} ayat
                                                    </span>
                                                )}
                                                {form.data.mistake[page]?.salahKata.length > 0 && (
                                                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                                                        {form.data.mistake[page].salahKata.length} kata
                                                    </span>
                                                )}
                                                {(!form.data.mistake[page]?.salahAyat || form.data.mistake[page].salahAyat.length === 0) &&
                                                    (!form.data.mistake[page]?.salahKata ||
                                                        form.data.mistake[page].salahKata.length === 0) && (
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                            Perfect
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                        {panels[page] ? (
                                            <ChevronUp className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        )}
                                    </div>

                                    {panels[page] && (
                                        <div className="space-y-4 p-4">
                                            <div>
                                                <div className="mb-3 flex items-center">
                                                    <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                                                    <h4 className="text-base font-medium text-gray-900">
                                                        {t('rekapan.form.kesalahan_ayat')}
                                                    </h4>
                                                </div>
                                                {!form.data.mistake[page]?.salahAyat || form.data.mistake[page].salahAyat.length === 0 ? (
                                                    <div className="rounded-md border border-green-200 bg-green-50 p-3">
                                                        <p className="flex items-center text-sm text-green-700">
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                            {t('rekapan.form.tidak_ada_kesalahan_ayat')}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {form.data.mistake[page].salahAyat.map((err, idx) => (
                                                            <div
                                                                key={`verse-${idx}`}
                                                                className={`rounded-md border p-3 ${getErrorColor(err.salahKey)}`}
                                                            >
                                                                <div className="flex items-start">
                                                                    <span className="mt-0.5 mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-gray-600">
                                                                        {idx + 1}
                                                                    </span>
                                                                    <div className="flex-1 flex items-center">
                                                                        <span
                                                                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${getErrorTextColor(
                                                                                err.salahKey
                                                                            )} border bg-white`}
                                                                        >
                                                                            Ayah : {err.noAyat}
                                                                        </span>
                                                                        <p className="ml-2 text-sm text-gray-700 text-right">{err.salah}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div className="mb-3 flex items-center">
                                                    <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
                                                    <h4 className="text-base font-medium text-gray-900">
                                                        {t('rekapan.form.kesalahan_kata')}
                                                    </h4>
                                                </div>
                                                {!form.data.mistake[page]?.salahKata || form.data.mistake[page].salahKata.length === 0 ? (
                                                    <div className="rounded-md border border-green-200 bg-green-50 p-3">
                                                        <p className="flex items-center text-sm text-green-700">
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                            {t('rekapan.form.tidak_ada_kesalahan_kata')}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {form.data.mistake[page].salahKata.map((err, idx) => (
                                                            <div
                                                                key={`word-${idx}`}
                                                                className={`rounded-md border p-3 ${getErrorColor(err.salahKey)}`}
                                                            >
                                                                <div className="flex items-start">
                                                                    <span className="mt-0.5 mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-gray-600">
                                                                        {idx + 1}
                                                                    </span>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center">
                                                                            <span
                                                                                className={`inline-block rounded-md border bg-white px-2 py-1 text-base ${getErrorTextColor(
                                                                                    err.salahKey
                                                                                )}`}
                                                                                style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                                                                            >
                                                                                {err.kata?.text || ''}
                                                                            </span>
                                                                            <p className="ml-2 text-sm text-gray-700 text-right">{err.salah}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="border-t border-gray-200 pt-4">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="mb-1 block text-xs font-medium text-gray-700">
                                                            {t('rekapan.form.kesimpulan')}
                                                        </label>
                                                        <select
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-1 focus:ring-blue-500"
                                                            value={form.data.mistake[page]?.kesimpulan || ''}
                                                            onChange={handlePageChange(page, 'kesimpulan')}
                                                        >
                                                            <option value="" className="text-sm text-gray-400">
                                                                {t('rekapan.form.pilih_kesimpulan')}
                                                            </option>
                                                            {['Excellent', 'Very Good', 'Good', 'Pass', 'Weak', 'Not Pass'].map(
                                                                (option) => (
                                                                    <option key={option} value={option}>
                                                                        {t(`rekapan.kesimpulan_options.${option}`)}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-xs font-medium text-gray-700">
                                                            {t('rekapan.form.catatan')}
                                                        </label>
                                                        <textarea
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-1 focus:ring-blue-500"
                                                            rows={2}
                                                            placeholder={t('rekapan.form.catatan_khusus')}
                                                            value={form.data.mistake[page]?.catatan || ''}
                                                            onChange={handlePageChange(page, 'catatan')}
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
        </AppWrapper>
    );
};

export default ResultFormLayout;
