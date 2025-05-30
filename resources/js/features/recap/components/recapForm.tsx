import React from 'react';

// Mock data for rendering (replace with actual data as needed)
const mockErrorsByPage = {
  '1': {
    ayatSalah: [
      { salahKey: 'tajweed', NamaSurat: 'Al-Fatihah', noAyat: 1, salah: 'Incorrect tajweed' },
    ],
    kataSalah: [
      { salahKey: 'pronunciation', kata: { text: '\u0627\u0644\u062d\u0645\u062d' }, salah: 'Mispronounced word' },
    ],
  },
  '2': {
    ayatSalah: [],
    kataSalah: [],
  },
};

// Mock translation function (replace with actual i18n, e.g., react-i18next)
const t = (key: string) => {
  const translations: { [key: string]: string } = {
    'general.hasilrekap': 'Recap Results',
    'rekapan.form.peserta': 'Participant',
    'rekapan.form.juz': 'Juz',
    'rekapan.form.halaman': 'Page',
    'rekapan.form.awal_surat': 'Start Surah',
    'rekapan.form.awal_ayat': 'Start Verse',
    'rekapan.form.akhir_surat': 'End Surah',
    'rekapan.form.akhir_ayat': 'End Verse',
    'rekapan.form.kesimpulan': 'Conclusion',
    'rekapan.form.pilih_kesimpulan': 'Select Conclusion',
    'rekapan.form.catatan': 'Notes',
    'rekapan.form.catatan_khusus': 'Special Notes',
    'rekapan.form.kesalahan_ayat': 'Verse Errors',
    'rekapan.form.tidak_ada_kesalahan_ayat': 'No Verse Errors',
    'rekapan.form.kesalahan_kata': 'Word Errors',
    'rekapan.form.tidak_ada_kesalahan_kata': 'No Word Errors',
    'rekapan.kesimpulan_options.Excellent': 'Excellent',
    'rekapan.kesimpulan_options.Very Good': 'Very Good',
    'rekapan.kesimpulan_options.Good': 'Good',
    'rekapan.kesimpulan_options.Pass': 'Pass',
    'rekapan.kesimpulan_options.Weak': 'Weak',
    'rekapan.kesimpulan_options.Not Pass': 'Not Pass',
    'rekapan.form.mengirim': 'Submitting...',
    'rekapan.form.kirim': 'Submit',
  };
  return translations[key] || key;
};

// Mock data for select options
const juzOptions = [
  { value: '1', label: 'Juz 1' },
  { value: '2', label: 'Juz 2' },
];
const pageOptions = [
  { value: '1', label: 'Page 1' },
  { value: '2', label: 'Page 2' },
];
const surahOptions = [
  { value: '1', label: 'Al-Fatihah' },
  { value: '2', label: 'Al-Baqarah' },
];
const verseOptions = [
  { value: '1', label: 'Ayat 1' },
  { value: '2', label: 'Ayat 2' },
];

const RecapFormLayout: React.FC = () => {
  // Mock values for rendering
  const tampilkanType = 'juz'; // Can be 'juz', 'halaman', or 'surat'
  const recapData = {
    namafullpeserta: 'John Doe',
    namaPenyimak: 'Jane Smith',
    kesimpulan: '',
    catatan: '',
  };
  const selectedJuz = '1';
  const selectedPage = '';
  const selectedStartSurah = '';
  const selectedStartVerse = '';
  const selectedEndSurah = '';
  const selectedEndVerse = '';
  const panels = { '1': true, '2': false };
  const pageConclusions = {};
  const pageNotes = {};
  const shouldShowDetails = true;

  const getErrorColor = (salahKey: string) => {
    return salahKey === 'tajweed' ? '#ffcccc' : '#ffe6cc';
  };

  const decodeUnicode = (text: string) => text;

  return (
    <div className="my-4 mx-auto max-w-7xl px-4">
      <h2 className="text-2xl font-bold text-center my-5">{t('general.hasilrekap')}</h2>
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">{t('rekapan.form.peserta')}</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
            value={recapData.namafullpeserta}
            disabled
          />
        </div>
        <div className="mb-3">
          <input type="hidden" value={recapData.namaPenyimak} />
        </div>
        {tampilkanType === 'juz' ? (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">{t('rekapan.form.juz')}</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={selectedJuz}
            >
              <option value="">{t('rekapan.form.juz') + '...'}</option>
              {juzOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : tampilkanType === 'halaman' ? (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">{t('rekapan.form.halaman')}</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={selectedPage}
            >
              <option value="">{t('rekapan.form.halaman') + '...'}</option>
              {pageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">{t('rekapan.form.awal_surat')}</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={selectedStartSurah}
                >
                  <option value="">{t('rekapan.form.awal_surat') + '...'}</option>
                  {surahOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">{t('rekapan.form.awal_ayat')}</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={selectedStartVerse}
                >
                  <option value="">{t('rekapan.form.awal_ayat') + '...'}</option>
                  {verseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">{t('rekapan.form.akhir_surat')}</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={selectedEndSurah}
                >
                  <option value="">{t('rekapan.form.akhir_surat') + '...'}</option>
                  {surahOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">{t('rekapan.form.akhir_ayat')}</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={selectedEndVerse}
                >
                  <option value="">{t('rekapan.form.akhir_ayat') + '...'}</option>
                  {verseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">{t('rekapan.form.kesimpulan')}</label>
          <select
            className="mt-1 block w-[200px] rounded-md border-gray-300 shadow-sm"
            value={recapData.kesimpulan}
          >
            <option value="" className="text-gray-400">
              {t('rekapan.form.pilih_kesimpulan')}
            </option>
            {['Excellent', 'Very Good', 'Good', 'Pass', 'Weak', 'Not Pass'].map((option) => (
              <option key={option} value={option}>
                {t(`rekapan.kesimpulan_options.${option}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700">{t('rekapan.form.catatan')}</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={recapData.catatan}
            placeholder={t('rekapan.form.catatan')}
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
            disabled={false}
          >
            {false ? t('rekapan.form.mengirim') : t('rekapan.form.kirim')}
          </button>
        </div>
      </div>
      {Object.entries(mockErrorsByPage)
        .sort(([pageA], [pageB]) => parseInt(pageA) - parseInt(pageB))
        .map(([page, errors]) => (
          <div key={page} className="bg-white rounded-lg shadow mb-3">
            <div
              className="flex items-center justify-between p-3"
              style={{ background: '#d9edf7', color: '#2C3E50', cursor: 'pointer' }}
            >
              <h5 className="m-0 text-[#31708f]">{`${t('rekapan.form.halaman')} ${page}`}</h5>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
                style={{
                  transform: panels[page] ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                  marginTop: '20px',
                  color: '#31708f',
                }}
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  fill="currentColor"
                  d="M12 15l-4.243-4.243 1.415-1.414L12 12.172l2.828-2.829 1.415 1.414z"
                />
              </svg>
            </div>
            {panels[page] && (
              <div className="p-3">
                <div className="mb-3">
                  <h6>{t('rekapan.form.kesalahan_ayat')}</h6>
                  {errors.ayatSalah.length === 0 ? (
                    <p className="text-gray-500">{t('rekapan.form.tidak_ada_kesalahan_ayat')}</p>
                  ) : (
                    <ul className="list-none p-0">
                      {errors.ayatSalah.map((err, idx) => (
                        <li
                          key={`verse-${idx}`}
                          className="border-b border-gray-200 py-2"
                        >
                          <span className="font-medium text-[15px] mr-1">{idx + 1}.</span>
                          <span
                            className="inline-block px-2 py-1 rounded text-sm"
                            style={{
                              backgroundColor: getErrorColor(err.salahKey),
                              color: '#000',
                              fontWeight: 500,
                            }}
                          >
                            {err.NamaSurat} : {err.noAyat}
                          </span>
                          <span className="ml-2">{err.salah}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mb-3">
                  <h6>{t('rekapan.form.kesalahan_kata')}</h6>
                  {errors.kataSalah.length === 0 ? (
                    <p className="text-gray-500">{t('rekapan.form.tidak_ada_kesalahan_kata')}</p>
                  ) : (
                    <ul className="list-none p-0">
                      {errors.kataSalah.map((err, idx) => (
                        <li
                          key={`word-${idx}`}
                          className="border-b border-gray-200 py-2"
                        >
                          <span className="font-medium text-[15px] mr-1">{idx + 1}.</span>
                          <span
                            className="inline-block px-2 py-1 rounded text-[20px]"
                            style={{
                              backgroundColor: getErrorColor(err.salahKey),
                              color: '#000',
                              fontFamily: "'Scheherazade New', 'Amiri', serif",
                            }}
                          >
                            {decodeUnicode(err.kata?.text || '')}
                          </span>
                          <span className="ml-2">{err.salah}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {shouldShowDetails && (
                  <>
                    <div className="mb-3">
                      <h6>{t('rekapan.form.kesimpulan')}</h6>
                      <select
                        className="mt-1 block w-[200px] rounded-md border-gray-300 shadow-sm"
                        value={pageConclusions[page] || ''}
                      >
                        <option value="" className="text-gray-400">
                          {t('rekapan.form.pilih_kesimpulan')}
                        </option>
                        {['Excellent', 'Very Good', 'Good', 'Pass', 'Weak', 'Not Pass'].map((option) => (
                          <option key={option} value={option}>
                            {t(`rekapan.kesimpulan_options.${option}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <h6>{t('rekapan.form.catatan')}</h6>
                      <textarea
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        value={pageNotes[page] || ''}
                        placeholder={t('rekapan.form.catatan_khusus')}
                      ></textarea>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default RecapFormLayout;
