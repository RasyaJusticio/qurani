import { useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Reciter {
  user_id: string;
  user_name: string;
  full_name: string;
}

interface Surah {
  id: string;
  name: string;
  first_verse: string;
  last_verse: string;
}

interface SalahAyat {
  salahKey: string;
  NamaSurat: string;
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

interface SetoranData {
  reciter: Reciter;
  recipient: string;
  setoran_type: string;
  display: string;
  page_number: string;
  surah: {
    id: string;
    name: string;
    first_surah: string;
    last_surah: string;
    first_verse: string;
    last_verse: string;
    surah: Surah[];
  };
  mistake: { [page: string]: { salahAyat: SalahAyat[]; salahKata: SalahKata[] } };
}

interface FormData {
  reciter: Reciter | null;
  recipient: string;
  setoran_type: string;
  display: string;
  page_number: string;
  surah: {
    id: string;
    name: string;
    first_surah: string;
    last_surah: string;
    first_verse: string;
    last_verse: string;
    surah: Surah[];
  } | null;
  mistake: Mistake;
  kesimpulan: string;
  catatan: string;
  selected_first_surah: string;
  selected_first_ayat: string;
  selected_last_surah: string;
  selected_last_ayat: string;
  [key: string]: any;
}

const t = (key: string): string => {
  const translations: { [key: string]: string } = {
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
    'rekapan.form.halaman': 'Halaman',
    'rekapan.kesimpulan_options.Excellent': 'Excellent',
    'rekapan.kesimpulan_options.Very Good': 'Very Good',
    'rekapan.kesimpulan_options.Good': 'Good',
    'rekapan.kesimpulan_options.Pass': 'Pass',
    'rekapan.kesimpulan_options.Weak': 'Weak',
    'rekapan.kesimpulan_options.Not Pass': 'Not Pass',
    'rekapan.form.kirim': 'Kirim',
    'rekapan.form.mengirim': 'Mengirim...'
  };
  return translations[key] || key;
};

const PageRecapFormLayout: React.FC = () => {
  const [panels, setPanels] = useState<{ [key: string]: boolean }>({});
  const [setoranData, setSetoranData] = useState<SetoranData | null>(null);

  const form = useForm<FormData>({
    reciter: null,
    recipient: '',
    setoran_type: '',
    display: '',
    page_number: '',
    surah: null,
    mistake: {},
    kesimpulan: '',
    catatan: '',
    selected_first_surah: '',
    selected_first_ayat: '',
    selected_last_surah: '',
    selected_last_ayat: '',
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (initialTheme) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    const listener = (e: MediaQueryListEvent) => {
        const newTheme = e.matches;
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', listener);

    return () => mq.removeEventListener('change', listener);
}, []);

  useEffect(() => {
    try {
      const data = localStorage.getItem('setoran-data');
      if (data) {
        const parsedData: SetoranData = JSON.parse(data);
        if (parsedData && parsedData.display === 'page' && parsedData.surah && Array.isArray(parsedData.surah.surah)) {
          setSetoranData(parsedData);
          const transformedMistake: Mistake = {};
          Object.entries(parsedData.mistake || {}).forEach(([page, data]) => {
            transformedMistake[page] = {
              ...data,
              kesimpulan: '',
              catatan: '',
              salahAyat: data.salahAyat || [],
              salahKata: data.salahKata || []
            };
          });
          form.setData({
            reciter: parsedData.reciter || { user_id: '', user_name: '', full_name: '' },
            recipient: parsedData.recipient || '',
            setoran_type: parsedData.setoran_type || '',
            display: 'page',
            page_number: parsedData.page_number || '',
            surah: parsedData.surah,
            mistake: transformedMistake,
            selected_first_surah: parsedData.surah.first_surah || '',
            selected_first_ayat: parsedData.surah.first_verse || '',
            selected_last_surah: parsedData.surah.last_surah || '',
            selected_last_ayat: parsedData.surah.last_verse || '',
            kesimpulan: '',
            catatan: ''
          });
          const initialPanels: { [key: string]: boolean } = {};
          Object.keys(parsedData.mistake || {}).forEach((key) => {
            initialPanels[key] = true;
          });
          setPanels(initialPanels);
        } else {
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    form.setData(name, value);
  };

  const handlePageChange = (page: string, field: 'kesimpulan' | 'catatan') =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      form.setData('mistake', {
        ...form.data.mistake,
        [page]: {
          ...form.data.mistake[page],
          [field]: value
        }
      });
    };

  const getAyatOptions = (surahId: string) => {
    const surah = setoranData?.surah.surah.find(s => s.id === surahId);
    if (!surah) return [];
    const from = parseInt(surah.first_verse);
    const to = parseInt(surah.last_verse);
    return Array.from({ length: to - from + 1 }, (_, i) => ({
      value: (from + i).toString(),
      label: `Ayat ${from + i}`
    }));
  };

  const getErrorColor = (salahKey: string): string => {
    return salahKey.includes('tajweed') ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200';
  };

  const getErrorTextColor = (salahKey: string): string => {
    return salahKey.includes('tajweed') ? 'text-red-700' : 'text-orange-700';
  };

  const togglePanel = (page: string): void => {
    setPanels((prev) => ({ ...prev, [page]: !prev[page] }));
  };

  const getPageName = (parsedData: SetoranData | null): string => {
    return parsedData?.surah?.name || 'Unknown Page';
  };

  const surahOptions = setoranData?.surah.surah.map(s => ({
    value: s.id,
    label: s.name
  })) || [];

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
        form.clearErrors();

        let hasError = false;

        if (!form.data.reciter?.user_name) {
            form.setError('reciter', 'Peserta harus dipilih');
            hasError = true;
        }

        const parsedRecipient = parseInt(form.data.recipient);
        if (!form.data.recipient || isNaN(parsedRecipient)) {
            form.setError('recipient', 'Penerima tidak valid');
            hasError = true;
        }

        if (!form.data.setoran_type) {
            form.setError('setoran_type', 'Jenis setoran harus dipilih');
            hasError = true;
        }

        if (!form.data.page_number || isNaN(parseInt(form.data.page_number))) {
            form.setError('page_number', 'Nomor halaman tidak valid');
            hasError = true;
        }

        if (!form.data.kesimpulan) {
            form.setError('kesimpulan', 'Kesimpulan harus dipilih');
            hasError = true;
        }

        if (!form.data.selected_first_surah || !form.data.selected_first_ayat) {
            form.setError('selected_first_surah', 'Awal surah dan ayat harus dipilih');
            hasError = true;
        }

        if (!form.data.selected_last_surah || !form.data.selected_last_ayat) {
            form.setError('selected_last_surah', 'Akhir surah dan ayat harus dipilih');
            hasError = true;
        }

        if (hasError) return;

        const firstVerse = `${form.data.selected_first_surah}-${form.data.selected_first_ayat}`;
        const lastVerse = `${form.data.selected_last_surah}-${form.data.selected_last_ayat}`;
        const info = `${firstVerse}-${lastVerse}`;
        const perhalamanData = Object.entries(form.data.mistake).map(([page, data]) => ({
            halaman: page,
            kesimpulan: data.kesimpulan || '',
            catatan: data.catatan || '',
            salah_ayat: data.salahAyat || [],
            salah_kata: data.salahKata || [],
        }));

        const postData = {
            penyetor: form.data.reciter?.user_name || '',
            penerima: parsedRecipient,
            setoran: form.data.setoran_type,
            tampilan: 'page',
            nomor: parseInt(form.data.page_number),
            info: info,
            hasil: form.data.kesimpulan,
            ket: form.data.catatan || null,
            perhalaman: perhalamanData,
        };

        console.log('Data dikirim:', postData);

        axios
            .post('/api/result', postData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    Accept: 'application/json',
                },
            })
            .then(() => {
                alert('Data berhasil dikirim!');
                localStorage.removeItem('setoran-data');
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

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Tambahkan tombol kembali di sini */}
            <button
                onClick={() => window.history.back()}
                className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                    />
                </svg>
                Kembali
            </button>
            </div>
                <div className="mb-6 text-center">
                    {/* <h1 className="mb-1 text-2xl font-bold text-gray-900">{t('general.hasilrekap')}</h1> */}
                </div>
                <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 grid grid-cols-1 gap-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.peserta')}</label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-1 focus:ring-blue-500"
                                value={form.data.reciter?.full_name || 'LinkID Moderator'}
                                disabled
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.awal_surah')}</label>
                                <select
                                    name="selected_first_surah"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-1 focus:ring-blue-500"
                                    value={form.data.selected_first_surah}
                                    onChange={handleChange}
                                >
                                    {surahOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.selected_first_surah && (
                                    <p className="mt-1 text-xs text-red-500">{form.errors.selected_first_surah}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.awal_ayat')}</label>
                                <select
                                    name="selected_first_ayat"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-1 focus:ring-blue-500"
                                    value={form.data.selected_first_ayat}
                                    onChange={handleChange}
                                >
                                    {getAyatOptions(form.data.selected_first_surah).map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.selected_first_ayat && (
                                    <p className="mt-1 text-xs text-red-500">{form.errors.selected_first_ayat}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.akhir_surah')}</label>
                                <select
                                    name="selected_last_surah"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-1 focus:ring-blue-500"
                                    value={form.data.selected_last_surah}
                                    onChange={handleChange}
                                >
                                    {surahOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.selected_last_surah && (
                                    <p className="mt-1 text-xs text-red-500">{form.errors.selected_last_surah}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700">{t('rekapan.form.akhir_ayat')}</label>
                                <select
                                    name="selected_last_ayat"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-1 focus:ring-blue-500"
                                    value={form.data.selected_last_ayat}
                                    onChange={handleChange}
                                >
                                    {getAyatOptions(form.data.selected_last_surah).map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.selected_last_ayat && (
                                    <p className="mt-1 text-xs text-red-500">{form.errors.selected_last_ayat}</p>
                                )}
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
                                            {`${pageName} - ${t('rekapan.form.halaman')} ${page}`}
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
                                                                <div className="flex-1">
                                                                    <div className="mb-1 flex items-center">
                                                                        <span
                                                                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${getErrorTextColor(
                                                                                err.salahKey
                                                                            )} border bg-white`}
                                                                        >
                                                                            {err.NamaSurat} : {err.noAyat}
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
                                                                    <div className="mb-1 flex items-center">
                                                                        <span
                                                                            className={`inline-block rounded-md border bg-white px-2 py-1 text-base ${getErrorTextColor(
                                                                                err.salahKey
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
                                                        {['Excellent', 'Very Good', 'Good', 'Pass', 'Weak', 'Not Pass'].map((option) => (
                                                            <option key={option} value={option}>
                                                                {t(`rekapan.kesimpulan_options.${option}`)}
                                                            </option>
                                                        ))}
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
    );
};

export default PageRecapFormLayout;