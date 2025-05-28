import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setupTranslations } from '@/features/i18n/i18n';

interface FilterSectionProps {}

const FilterSection: React.FC<FilterSectionProps> = () => {
  const { t } = useTranslation('filter');
  const [translationsReady, setTranslationsReady] = useState(false);

  useEffect(() => {
    const loadTranslations = async () => {
      await setupTranslations('filter');
      setTranslationsReady(true);
    };
    loadTranslations();
  }, []);

  if (!translationsReady) return null;

  return (
    <div id="filter-section" className="tab-content active px-4 py-6">
      <div className="max-w-full mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6 border border-gray-200">
        {/* Header */}
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">🔍 {t('filter.title')}</h3>

        {/* Filter Form */}
        <form method="POST" id="filterForm" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Waktu */}
            <div className="flex flex-col">
              <label htmlFor="waktu_start" className="mb-1 font-medium text-sm text-gray-600">
                {t('filter.labels.time')}
              </label>
              <input
                type="date"
                name="waktu_start"
                id="waktu_start"
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Penyetor */}
            <div className="flex flex-col">
              <label htmlFor="penyetorInput" className="mb-1 font-medium text-sm text-gray-600">
                {t('filter.labels.reciter')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="penyetorInput"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder={t('filter.placeholders.select_reciter')}
                  autoComplete="off"
                  spellCheck="false"
                />
                <div id="penyetorDropdown" className="absolute z-10 bg-white border mt-1 rounded-md w-full shadow hidden">
                  {/* Dropdown items here */}
                </div>
                <input type="hidden" id="selectedPenyetor" name="penyetor" />
              </div>
            </div>

            {/* Penerima */}
            <div className="flex flex-col">
              <label htmlFor="penerimaInput" className="mb-1 font-medium text-sm text-gray-600">
                {t('filter.labels.recipient')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="penerimaInput"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder={t('filter.placeholders.select_recipient')}
                  autoComplete="off"
                  spellCheck="false"
                />
                <div id="penerimaDropdown" className="absolute z-10 bg-white border mt-1 rounded-md w-full shadow hidden">
                  {/* Dropdown items here */}
                </div>
                <input type="hidden" id="selectedPenerima" name="penerima" />
              </div>
            </div>

            {/* Hasil */}
            <div className="flex flex-col">
              <label htmlFor="hasil" className="mb-1 font-medium text-sm text-gray-600">
                {t('filter.labels.result')}
              </label>
              <select
                name="hasil"
                id="hasil"
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="semua">{t('filter.options.result.all')}</option>
                <option value="Lancar">{t('filter.options.result.fluent')}</option>
                <option value="Tidak Lancar">{t('filter.options.result.not_fluent')}</option>
                <option value="Lulus">{t('filter.options.result.pass')}</option>
                <option value="Tidak Lulus">{t('filter.options.result.fail')}</option>
                <option value="Mumtaz">{t('filter.options.result.excellent')}</option>
                <option value="Dhoif">{t('filter.options.result.weak')}</option>
              </select>
            </div>

            {/* Paraf */}
            <div className="flex flex-col">
              <label htmlFor="paraf" className="mb-1 font-medium text-sm text-gray-600">
                {t('filter.labels.signature')}
              </label>
              <select
                name="paraf"
                id="paraf"
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="semua">{t('filter.options.signature.all')}</option>
                <option value="1">{t('filter.options.signature.available')}</option>
                <option value="0">{t('filter.options.signature.not_available')}</option>
              </select>
            </div>
          </div>

          {/* Tombol */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {t('filter.buttons.show')}
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              {t('filter.buttons.reset')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FilterSection;
