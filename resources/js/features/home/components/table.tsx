import { Grid2X2, SquareActivity } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setupTranslations } from '@/features/i18n/i18n';

interface HistoryTableProps {
  fluidDesign: boolean;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ fluidDesign }) => {
  const { t } = useTranslation('table');
  const [translationsReady, setTranslationsReady] = useState(false);

  useEffect(() => {
    const loadTranslations = async () => {
      await setupTranslations('table');
      setTranslationsReady(true);
    };
    loadTranslations();
  }, []);

  if (!translationsReady) return null; // Tampilkan loading atau null sampai terjemahan siap

  return (
    <div className={fluidDesign ? 'mt-3 w-full' : 'mx-auto mt-3 w-full'}>
      <div className="flex justify-center">
        <div className="w-full overflow-x-auto">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <a href="#" className="text-2xl font-semibold hover:underline">
                {t('history.title')}
              </a>
              <div className="flex gap-2">
                <button
                  className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100"
                  aria-label={t('history.tableButtonLabel') || 'Table View'}
                >
                  <SquareActivity size={20} />
                </button>
                <button
                  className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100"
                  title={t('history.settingsButtonTitle') || 'Settings'}
                  aria-label={t('history.settingsButtonLabel') || 'Settings'}
                >
                  <Grid2X2 size={20} />
                </button>
              </div>
            </div>

            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {[
                    'history.table.time',
                    'history.table.reciter',
                    'history.table.recipient',
                    'history.table.recite',
                    'history.table.results',
                    'history.table.signature',
                  ].map((key) => (
                    <th
                      key={key}
                      className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700"
                    >
                      {t(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="border border-gray-200 px-4 py-2 text-center text-sm">
                    {t('history.table.noData')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryTable;
