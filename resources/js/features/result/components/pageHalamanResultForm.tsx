import Alert from '@/components/ui/Alert';
import Combobox from '@/components/ui/combobox';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

interface ErrorLabel {
    id: number;
    key: string;
    value: string;
    color: string;
    status: number;
}

interface SetoranData {
    reciter: Reciter;
    recipient: string;
    setoran_type: string;
    display: string;
    selectedGroup: string;
    selectdeHalaman: string;
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
    setoran: string;
    display: string;
    // page_number: string;
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

interface SurahOption {
    label: string;
    value: number;
}
interface AyatOption {
    value: number;
    label: number;
}

interface PageProps {
    labels: {
        surah: SurahOption[];
        ayat: {
            [key: number]: AyatOption[];
        };
    };
    user_id: number;
    errorLabels: ErrorLabel[]
    previousUrl: string;
    [key: string]: unknown;
}

const PageRecapFormLayout: React.FC = () => {
    const { props } = usePage<PageProps>();
    const [panels, setPanels] = useState<{ [key: string]: boolean }>({});
    const [setoranData, setSetoranData] = useState<SetoranData | null>(null);
    const [alert, setAlert] = useState<boolean>(false)
    const { t } = useTranslation('resultForm');
    const btnSubmit = useRef<HTMLButtonElement>(null);
    const form = useForm<FormData>({
        reciter: null,
        recipient: '',
        setoran: '',
        display: '',
        // page_number: '',
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
                if (parsedData && parsedData.display === 'page' && parsedData.surah /*&& Array.isArray(parsedData.surah.surah)*/) {
                    setSetoranData(parsedData);
                    const transformedMistake: Mistake = {};
                    Object.entries(parsedData.mistake || {}).forEach(([page, data]) => {
                        transformedMistake[page] = {
                            ...data,
                            kesimpulan: '',
                            catatan: '',
                            salahAyat: data.salahAyat || [],
                            salahKata: data.salahKata || [],
                        };
                    });
                    const awalSurah = props.labels.surah[0].value;
                    const akhirSurah = props.labels.surah[props.labels.surah.length - 1].value;
                    const awalAyat = props.labels.ayat[`${props.labels.surah[0].value}`][0].value;
                    const akhirAyat = props.labels.ayat[akhirSurah][props.labels.ayat[akhirSurah].length - 1].value;
                    form.setData({
                        reciter: parsedData.reciter || { user_id: '', user_name: '', full_name: '' },
                        recipient: props.user_id || '',
                        setoran: parsedData.setoran || '',
                        display: 'halaman',
                        // page_number: parsedData.page_number || '',
                        surah: parsedData.surah,
                        mistake: transformedMistake,
                        selected_first_surah: awalSurah,
                        selected_last_surah: akhirSurah,
                        selected_first_ayat: awalAyat,
                        selected_last_ayat: akhirAyat,
                        kesimpulan: '',
                        catatan: '',
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
    }, [props]);

    const handleChange = (key: keyof FormData, value: string) => {
        form.setData(key, value);
        if (key == 'selected_first_surah') {
            if (!value) {
                form.setData('selected_first_ayat', '');
            } else {
                form.setData('selected_first_ayat', props.labels.ayat[`${value}`][0].value);
            }
        }
        if (key == 'selected_last_surah') {
            if (!value) {
                form.setData('selected_last_ayat', '');
            } else {
                form.setData('selected_last_ayat', props.labels.ayat[`${value}`][props.labels.ayat[`${value}`].length - 1].value);
            }
        }
        form.clearErrors(key);
    };

    const handlePageChange = (page: string, field: 'kesimpulan' | 'catatan') => (value: string) => {
        form.setData('mistake', {
            ...form.data.mistake,
            [page]: {
                ...form.data.mistake[page],
                [field]: value,
            },
        });
    };

    const togglePanel = (page: string): void => {
        setPanels((prev) => ({ ...prev, [page]: !prev[page] }));
    };

    const getPageName = (parsedData: SetoranData | null): string => {
        return parsedData?.surah?.name || 'Unknown Page';
    };

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

        if (!form.data.setoran) {
            form.setError('setoran_type', 'Jenis setoran harus dipilih');
            hasError = true;
        }

        // if (!form.data.page_number || isNaN(parseInt(form.data.page_number))) {
        //     form.setError('page_number', 'Nomor halaman tidak valid');
        //     hasError = true;
        // }

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
            setoran: form.data.setoran,
            tampilan: 'page',
            nomor: setoranData.selectedHalaman,
            info: info,
            hasil: form.data.kesimpulan,
            ket: form.data.catatan || null,
            perhalaman: perhalamanData,
        };

        if (btnSubmit.current) {
            if (btnSubmit.current.disabled) return; // Prevent multiple submissions
            btnSubmit.current.disabled = true;
        }

        axios
            .post('/api/result', postData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    Accept: 'application/json',
                },
            })
            .then(() => {
                // alert('Data berhasil dikirim!');
                setAlert(true)
                localStorage.removeItem('setoran-data');
                localStorage.setItem("verseErrors", "{}")
                localStorage.setItem("wordErrors", "{}")
                // router.visit('/home');
            })
            .catch((error) => {
                console.log(error.response.data);
                if (error.response && error.response.status === 422) {
                    const errors = error.response.data.errors;
                    Object.keys(errors).forEach((key) => {
                        form.setError(key as keyof FormData, errors[key][0]);
                    });
                } else {
                    console.error('Error:', error);
                    form.setError('submit', 'Gagal mengirim data. Silakan coba lagi.');
                }
            }).finally(() => {
                if (btnSubmit.current) {
                    btnSubmit.current.disabled = false;
                }
            });
    };

    const generateConclusionOptions = (): { value: string; label: string }[] => {
        return ['Excellent', 'Very Good', 'Good', 'Pass', 'Weak', 'Not Pass'].map((option) => ({
            value: option,
            label: t(`rekapan.kesimpulan_options.${option}`), // Gunakan t dari useTranslation
        }));
    };
    const conclusionOptions = generateConclusionOptions();

    if (!props.labels || !setoranData) {
        return null;
    }
    function generateVerseOptions(s: string): AyatOption[] {
        // if(!form.data.selected_first_surah|| !form.data.selected_last_surah_surah) return;
        if (s == 'awal') {
            let verses;
            if (!form.data.selected_first_surah) {
                verses = props.labels.ayat[`${props.labels.surah[0].value}`];
            } else {
                verses = props.labels.ayat[`${form.data.selected_first_surah}`];
            }
            return verses;
        } else {
            let verses;
            if (!form.data.selected_last_surah) {
                verses = props.labels.ayat[props.labels.surah[props.labels.surah.length - 1].value];
            } else {
                verses = props.labels.ayat[`${form.data.selected_last_surah}`];
            }
            return verses;
            // let akhirSurah = props.labels.surah[form.data.selected_last_surah].value;
        }
    }

    const getErrorColor = (salahKey: string): string => {
        return salahKey.includes('tajweed')
            ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
            : 'bg-orange-50 dark:bg-orange-900 border-orange-200 dark:border-orange-700';
    };

    const getErrorTextColor = (salahKey: string): string => {
        return salahKey.includes('tajweed') ? 'text-red-700 dark:text-red-200' : 'text-orange-700 dark:text-orange-200';
    };

    function checkPanel(): string {
        let result = 'tampilkan';
        const displayPanelCheck =
            props.errorLabels;
        displayPanelCheck.map((v: ErrorLabel, i: number) => {
            if (v.key == 'kesimpulan') {
                result = v.value;
            }
        });
        return result;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 dark:bg-[rgb(16,24,40)]">
            <div className="mx-auto mt-12 w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                <Alert show={alert} to='/home' heading='Data Berhasil Dikirim' message='Lihat Detail Recap pada tabel' />
                <div className="mb-6 text-center dark:bg-[rgb(16,24,40)]">
                    {/* <h1 className="mb-1 text-2xl font-bold text-gray-900">{t('general.hasilrekap')}</h1> */}
                    <Link
                        href={props.previousUrl}
                        className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-1 h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Link>
                </div>
                <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 grid grid-cols-1 gap-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-[rgb(209,213,220)]">
                                {t('rekapan.form.peserta')}
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
                                value={form.data.reciter?.full_name || 'LinkID Moderator'}
                                disabled
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-[rgb(209,213,220)]">
                                    {t('rekapan.form.awal_surah')}
                                </label>
                                <Combobox
                                    options={props.labels.surah}
                                    placeholder={t('placeholders.select_verse')}
                                    searchPlaceholder={t('placeholders.search_verse')}
                                    notFoundText={t('notFoundText.verse_not_found')}
                                    value={form.data.selected_first_surah}
                                    onValueChange={(value) => handleChange('selected_first_surah', value)}
                                    className="w-full"
                                />
                                {form.errors.selected_first_surah && <p className="mt-1 text-xs text-red-500">{form.errors.selected_first_surah}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-[rgb(209,213,220)]">
                                    {t('rekapan.form.awal_ayat')}
                                </label>
                                <div className={`${!form.data.selected_first_surah ? 'pointer-events-none opacity-50' : ''}`}>
                                    <Combobox
                                        options={generateVerseOptions('awal')}
                                        placeholder={t('placeholders.select_verse')}
                                        searchPlaceholder={t('placeholders.search_verse')}
                                        notFoundText={t('notFoundText.verse_not_found')}
                                        value={form.data.selected_first_ayat}
                                        onValueChange={(value) => handleChange('selected_first_ayat', value)}
                                        className="w-full"
                                    />
                                </div>
                                {form.errors.selected_first_ayat && <p className="mt-1 text-xs text-red-500">{form.errors.selected_first_ayat}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-[rgb(209,213,220)]">
                                    {t('rekapan.form.akhir_surah')}
                                </label>
                                <Combobox
                                    options={props.labels.surah}
                                    placeholder={t('placeholders.select_verse')}
                                    searchPlaceholder={t('placeholders.search_verse')}
                                    notFoundText={t('notFoundText.verse_not_found')}
                                    value={form.data.selected_last_surah}
                                    onValueChange={(value) => handleChange('selected_last_surah', value)}
                                    className="w-full"
                                />
                                {form.errors.selected_last_surah && <p className="mt-1 text-xs text-red-500">{form.errors.selected_last_surah}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-[rgb(209,213,220)]">
                                    {t('rekapan.form.akhir_ayat')}
                                </label>
                                <div className={`${!form.data.selected_last_surah ? 'pointer-events-none opacity-50' : ''}`}>
                                    <Combobox
                                        options={generateVerseOptions('akhir')}
                                        placeholder={t('placeholders.select_verse')}
                                        searchPlaceholder={t('placeholders.search_verse')}
                                        notFoundText={t('notFoundText.verse_not_found')}
                                        value={form.data.selected_last_ayat}
                                        onValueChange={(value) => handleChange('selected_last_ayat', value)}
                                        className="w-full"
                                    />
                                </div>
                                {form.errors.selected_last_ayat && <p className="mt-1 text-xs text-red-500">{form.errors.selected_last_ayat}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-[rgb(209,213,220)]">
                                {t('rekapan.form.kesimpulan')}
                            </label>
                            <Combobox
                                options={conclusionOptions}
                                placeholder={t('placeholders.select_conclusion')}
                                searchPlaceholder={t('placeholders.search_conclusion')}
                                notFoundText={t('notFoundText.conclusion_not_found')}
                                value={form.data.kesimpulan}
                                onValueChange={(value) => handleChange('kesimpulan', value)}
                                className="w-full" // Tambahkan ini untuk menyamakan lebar dengan "Awal Surah"
                            />
                            {form.errors.kesimpulan && <p className="mt-1 text-xs text-red-500">{form.errors.kesimpulan}</p>}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-[rgb(209,213,220)]">
                            {t('rekapan.form.catatan')}
                        </label>
                        <textarea
                            name="catatan"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                            rows={3}
                            placeholder={t('rekapan.form.catatan')}
                            value={form.data.catatan}
                            onChange={(e) => handleChange('catatan', e.target.value)}
                        />
                        {form.errors.catatan && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{form.errors.catatan}</p>}
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="rounded-md bg-[rgb(94,114,228)] px-4 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-[rgb(57,69,138)] disabled:cursor-not-allowed disabled:bg-blue-300"
                            ref={btnSubmit}
                        >
                            {form.processing ? t('rekapan.form.mengirim') : t('rekapan.form.kirim')}
                        </button>
                    </div>
                    {form.errors.submit && <p className="mt-2 text-xs text-red-500">{form.errors.submit}</p>}
                </div>
                {checkPanel() == 'tampilkan' && (
                    <div className="space-y-3 mb-20 lg:mb-0">
                        {Object.entries(setoranData.mistake || {})
                            .sort(([pageA], [pageB]) => parseInt(pageA) - parseInt(pageB))
                            .map(([page, errors]) => (
                                <div
                                    key={page}
                                    className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <div
                                        className="flex cursor-pointer items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 hover:bg-blue-100 dark:border-gray-700 dark:from-blue-900 dark:to-indigo-900 dark:hover:bg-blue-800"
                                        onClick={() => togglePanel(page)}
                                    >
                                        <div className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                                {`${getPageName(setoranData)}`}
                                                {/* {`${getPageName(setoranData)} - ${t('rekapan.form.halaman')} ${page}`} */}
                                            </h3>
                                            <div className="ml-3 flex items-center space-x-2">
                                                {form.data.mistake[page]?.salahAyat.length > 0 && (
                                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        {form.data.mistake[page].salahAyat.length} ayat
                                                    </span>
                                                )}
                                                {form.data.mistake[page]?.salahKata.length > 0 && (
                                                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                                        {form.data.mistake[page].salahKata.length} kata
                                                    </span>
                                                )}
                                                {(!form.data.mistake[page]?.salahAyat || form.data.mistake[page].salahAyat.length === 0) &&
                                                    (!form.data.mistake[page]?.salahKata || form.data.mistake[page].salahKata.length === 0) && (
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                            Perfect
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                        {panels[page] ? (
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        )}
                                    </div>

                                    {panels[page] && (
                                        <div className="space-y-4 p-4">
                                            <div>
                                                <div className="mb-3 flex items-center">
                                                    <AlertCircle className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" />
                                                    <h4 className="text-base font-medium text-gray-900 dark:text-white">
                                                        {t('rekapan.form.kesalahan_ayat')}
                                                    </h4>
                                                </div>
                                                {!form.data.mistake[page]?.salahAyat || form.data.mistake[page].salahAyat.length === 0 ? (
                                                    <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900">
                                                        <p className="flex items-center text-sm text-green-700 dark:text-green-200">
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
                                                                    <span className="mt-0.5 mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                                        {idx + 1}
                                                                    </span>
                                                                    <div className="flex flex-1 items-center">
                                                                        <span
                                                                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${getErrorTextColor(
                                                                                err.salahKey,
                                                                            )}`}
                                                                        >
                                                                            {t("rekapan.form.ayat")} : {err.noAyat}
                                                                        </span>
                                                                        <p className="ml-2 text-right text-sm text-gray-700 dark:text-gray-300">
                                                                            {err.salah}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div className="mb-3 flex items-center">
                                                    <AlertCircle className="mr-2 h-4 w-4 text-orange-500 dark:text-orange-400" />
                                                    <h4 className="text-base font-medium text-gray-900 dark:text-white">
                                                        {t('rekapan.form.kesalahan_kata')}
                                                    </h4>
                                                </div>
                                                {!form.data.mistake[page]?.salahKata || form.data.mistake[page].salahKata.length === 0 ? (
                                                    <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900">
                                                        <p className="flex items-center text-sm text-green-700 dark:text-green-200">
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
                                                                    <span className="mt-0.5 mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                                        {idx + 1}
                                                                    </span>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center">
                                                                            <span
                                                                                className={`inline-block rounded-md border bg-white px-2 py-1 text-base dark:bg-gray-700 ${getErrorTextColor(
                                                                                    err.salahKey,
                                                                                )}`}
                                                                                style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                                                                            >
                                                                                {err.kata?.text || ''}
                                                                            </span>
                                                                            <p className="ml-2 text-right text-sm text-gray-700 dark:text-gray-300">
                                                                                {err.salah}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                            {t('rekapan.form.kesimpulan')}
                                                        </label>
                                                        <div className="w-full">
                                                            <Combobox
                                                                options={conclusionOptions}
                                                                placeholder={t('placeholders.select_conclusion')}
                                                                searchPlaceholder={t('placeholders.search_conclusion')}
                                                                notFoundText={t('notFoundText.conclusion_not_found')}
                                                                value={form.data.mistake[page]?.kesimpulan || ''}
                                                                onValueChange={handlePageChange(page, 'kesimpulan')}
                                                            // className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-black'}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                                            {t('rekapan.form.catatan')}
                                                        </label>
                                                        <textarea
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                                                            rows={2}
                                                            placeholder={t('rekapan.form.catatan_khusus')}
                                                            value={form.data.mistake[page]?.catatan || ''}
                                                            onChange={(e) => handlePageChange(page, 'catatan')(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageRecapFormLayout;
