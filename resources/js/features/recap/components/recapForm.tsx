import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

interface Reciter {
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
  };
}

interface SetoranData {
  reciter: Reciter;
  setoran_type: string;
  display: string;
  surah_id: string;
  surah: Surah;
  mistake: Mistake;
}

interface VerseOption {
  value: string;
  label: string;
}

const t = (key: string): string => {
  const translations: { [key: string]: string } = {
    'general.hasilrekap': 'Hasil Setoran',
    'rekapan.form.peserta': 'Peserta',
    'rekapan.form.awal_surat': 'Awal Surat',
    'rekapan.form.awal_ayat': 'Awal Ayat',
    'rekapan.form.akhir_surat': 'Akhir Surat',
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
    'rekapan.form.setoran_type': 'Jenis Setoran',
  };
  return translations[key] || key;
};

const RecapFormLayout: React.FC = () => {
  const [panels, setPanels] = useState<{ [key: string]: boolean }>({});
  const [setoranData, setSetoranData] = useState<SetoranData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [kesimpulan, setKesimpulan] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [awalAyat, setAwalAyat] = useState<string>('');
  const [akhirAyat, setAkhirAyat] = useState<string>('');

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('setoran-data');
      const parsedData: SetoranData | null = storedData ? JSON.parse(storedData) : null;

      if (parsedData) {
        setSetoranData(parsedData);
        setAwalAyat(parsedData.surah?.from || '');
        setAkhirAyat(parsedData.surah?.to || '');
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
    return salahKey.includes('tajweed') ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200';
  };

  const getErrorTextColor = (salahKey: string): string => {
    return salahKey.includes('tajweed') ? 'text-red-700' : 'text-orange-700';
  };

  const getSurahName = (parsedData: SetoranData | null): string => {
    return parsedData?.surah?.name || 'Unknown Surah';
  };

  const handleSubmit = (): void => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Data berhasil dikirim!');
    }, 2000);
  };

  if (!setoranData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading data...</p>
        </div>
      </div>
    );
  }

  const verseOptions: VerseOption[] = generateVerseOptions(setoranData);
  const surahName: string = getSurahName(setoranData);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('general.hasilrekap')}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('rekapan.form.peserta')}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                value={setoranData.reciter?.full_name || ''}
                disabled
              />
            </div>

            {/* <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('rekapan.form.setoran_type')}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                value={setoranData.setoran_type ? setoranData.setoran_type.charAt(0).toUpperCase() + setoranData.setoran_type.slice(1) : ''}
                disabled
              />
            </div> */}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('rekapan.form.awal_surat')}</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm"
                  value={surahName}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('rekapan.form.awal_ayat')}</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  value={awalAyat}
                  onChange={(e) => setAwalAyat(e.target.value)}
                >
                  <option value="" className="text-gray-400 text-sm">
                    {t('rekapan.form.awal_ayat')}
                  </option>
                  {verseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('rekapan.form.akhir_surat')}</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm"
                  value={surahName}
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('rekapan.form.akhir_ayat')}</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  value={akhirAyat}
                  onChange={(e) => setAkhirAyat(e.target.value)}
                >
                  <option value="" className="text-gray-400 text-sm">
                    {t('rekapan.form.akhir_ayat')}
                  </option>
                  {verseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('rekapan.form.kesimpulan')}</label>
              <select
                className="w-50 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                value={kesimpulan}
                onChange={(e) => setKesimpulan(e.target.value)}
              >
                <option value="" className="text-gray-400 text-sm">
                  {t('rekapan.form.pilih_kesimpulan')}
                </option>
                {['Excellent', 'Very Good', 'Good', 'Pass', 'Weak', 'Not Pass'].map((option) => (
                  <option key={option} value={option}>
                    {t(`rekapan.kesimpulan_options.${option}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('rekapan.form.catatan')}</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder={t('rekapan.form.catatan')}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-[rgb(94,114,228)] text-white rounded-md text-sm font-medium hover:bg-[rgb(57,69,138)] hover:cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? t('rekapan.form.mengirim') : t('rekapan.form.kirim')}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(setoranData.mistake || {})
            .sort(([pageA], [pageB]) => parseInt(pageA) - parseInt(pageB))
            .map(([page, errors]) => (
              <div key={page} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 cursor-pointer hover:bg-blue-100"
                  onClick={() => togglePanel(page)}
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-blue-600 mr-2" />
                    <h3 className="text-base font-medium text-gray-900">
                      {`${surahName} - ${t('rekapan.form.halaman')} ${page}`}
                    </h3>
                    <div className="ml-3 flex items-center space-x-2">
                      {errors.salahAyat && errors.salahAyat.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {errors.salahAyat.length} ayat
                        </span>
                      )}
                      {errors.salahKata && errors.salahKata.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {errors.salahKata.length} kata
                        </span>
                      )}
                      {(!errors.salahAyat || errors.salahAyat.length === 0) &&
                        (!errors.salahKata || errors.salahKata.length === 0) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Perfect
                          </span>
                        )}
                    </div>
                  </div>
                  {panels[page] ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>

                {panels[page] && (
                  <div className="p-4 space-y-4">
                    <div>
                      <div className="flex items-center mb-3">
                        <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                        <h4 className="text-base font-medium text-gray-900">{t('rekapan.form.kesalahan_ayat')}</h4>
                      </div>
                      {!errors.salahAyat || errors.salahAyat.length === 0 ? (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                          <p className="text-green-700 text-sm flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t('rekapan.form.tidak_ada_kesalahan_ayat')}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {errors.salahAyat.map((err, idx) => (
                            <div key={`verse-${idx}`} className={`p-3 rounded-md border ${getErrorColor(err.salahKey)}`}>
                              <div className="flex items-start">
                                <span className="inline-flex items-center justify-center w-5 h-5 bg-white rounded-full text-xs font-medium text-gray-600 mr-2 mt-0.5">
                                  {idx + 1}
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center mb-1">
                                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${getErrorTextColor(err.salahKey)} bg-white border`}>
                                      {err.NamaSurat} : {err.noAyat}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm">{err.salah}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center mb-3">
                        <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                        <h4 className="text-base font-medium text-gray-900">{t('rekapan.form.kesalahan_kata')}</h4>
                      </div>
                      {!errors.salahKata || errors.salahKata.length === 0 ? (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                          <p className="text-green-700 text-sm flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t('rekapan.form.tidak_ada_kesalahan_kata')}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {errors.salahKata.map((err, idx) => (
                            <div key={`word-${idx}`} className={`p-3 rounded-md border ${getErrorColor(err.salahKey)}`}>
                              <div className="flex items-start">
                                <span className="inline-flex items-center justify-center w-5 h-5 bg-white rounded-full text-xs font-medium text-gray-600 mr-2 mt-0.5">
                                  {idx + 1}
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center mb-1">
                                    <span
                                      className={`inline-block px-2 py-1 rounded-md text-base bg-white border ${getErrorTextColor(err.salahKey)}`}
                                      style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                                    >
                                      {err.kata?.text || ''}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm">{err.salah}</p>
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
                          <label className="block text-xs font-medium text-gray-700 mb-1">{t('rekapan.form.kesimpulan')}</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                            <option value="" className="text-gray-400 text-sm">
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
                          <label className="block text-xs font-medium text-gray-700 mb-1">{t('rekapan.form.catatan')}</label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                            placeholder={t('rekapan.form.catatan_khusus')}
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

export default RecapFormLayout;
