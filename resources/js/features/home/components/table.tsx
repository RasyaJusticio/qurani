import { Grid2X2, SquareActivity } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setupTranslations } from '@/features/i18n/i18n';

interface HistoryItem {
  id: string;
  formatted_date: string;
  penyetor_id: string;
  penyetor_name: string;
  penyetor_fullname?: string;
  penerima_name: string;
  penerima_fullname?: string;
  penerima_id: string;
  setoran: string;
  hasil: string;
  paraf: number;
}

interface HistoryTableProps {
  systemUrl: string;
  fluidDesign: boolean;
  historyData: HistoryItem[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ systemUrl, fluidDesign, historyData }) => {
  const { t } = useTranslation('table');

  useEffect(() => {
    const loadTranslations = async () => {
      await setupTranslations('table');
    };
    loadTranslations();
  }, []);

  const handleTableButtonClick = () => {};

  const handleSettingsButtonClick = () => {
    localStorage.setItem('activeTab', 'statistics');
  };

  return (
    <div className={fluidDesign ? 'mt-3 w-full' : 'mx-auto mt-3 max-w-7xl'}>
      <div className="flex justify-center">
        <div className="w-full overflow-x-auto">
          <div className="w-full">
            <div className="rounded-lg bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <a href={`${systemUrl}`}>
                  <h3 className="mb-0 text-left text-2xl font-semibold hover:underline">
                    {t('history.title')}
                  </h3>
                </a>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-full transition-colors hover:cursor-pointer"
                    onClick={handleTableButtonClick}
                  >
                    <SquareActivity />
                  </button>
                  <button
                    className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-full transition-colors hover:cursor-pointer"
                    id="settingsBtnHistory"
                    title={t('history.settingsButtonTitle')}
                    onClick={handleSettingsButtonClick}
                  >
                    <Grid2X2 />
                  </button>
                </div>
              </div>

              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {t('history.table.time')}
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {t('history.table.reciter')}
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {t('history.table.recipient')}
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {t('history.table.recite')}
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {t('history.table.results')}
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-700">
                      {t('history.table.signature')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historyData && historyData.length > 0 ? (
                    historyData.map((setoran) => (
                      <tr key={setoran.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2 text-sm" data-label={t('history.table.time')}>
                          <a
                            href={`${systemUrl}/qurani/riwayat/${setoran.id}`}
                            className="text-blue-600 hover:underline"
                            data-id={setoran.id}
                          >
                            {setoran.formatted_date}
                          </a>
                        </td>
                        <td
                          className="border border-gray-200 px-4 py-2 text-sm"
                          data-label={t('history.table.reciter')}
                        >
                          <span className="js_user-popover" data-uid={setoran.penyetor_id}>
                            <a
                              href={`${systemUrl}/${setoran.penyetor_name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative text-blue-600 hover:underline"
                            >
                              {setoran.penyetor_name}
                              <span className="absolute -top-8 left-1/2 hidden -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                                {setoran.penyetor_fullname || setoran.penyetor_name}
                              </span>
                            </a>
                          </span>
                        </td>
                        <td
                          className="border border-gray-200 px-4 py-2 text-sm"
                          data-label={t('history.table.recipient')}
                        >
                          <a
                            href={`${systemUrl}/${setoran.penerima_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative text-blue-600 hover:underline"
                          >
                            {setoran.penerima_name}
                            <span className="absolute -top-8 left-1/2 hidden -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
                              {setoran.penerima_fullname || setoran.penerima_name}
                            </span>
                          </a>
                        </td>
                        <td
                          className="border border-gray-200 px-4 py-2 text-sm"
                          data-label={t('history.table.recite')}
                        >
                          <a
                            href={`${systemUrl}/qurani/riwayat/${setoran.id}`}
                            className="text-blue-600 hover:underline"
                            data-id={setoran.id}
                          >
                            {setoran.setoran}
                          </a>
                        </td>
                        <td
                          className="border border-gray-200 px-4 py-2 text-sm"
                          data-label={t('history.table.results')}
                        >
                          <a
                            href={`${systemUrl}/qurani/riwayat/${setoran.id}`}
                            className="text-blue-600 hover:underline"
                            data-id={setoran.id}
                          >
                            {setoran.hasil}
                          </a>
                        </td>
                        <td
                          className="border border-gray-200 px-4 py-2 text-center text-sm"
                          data-label={t('history.table.signature')}
                        >
                          {setoran.paraf === 1 ? (
                            <i className="fas fa-check text-green-500"></i>
                          ) : (
                            <span
                              className="paraf-clickable cursor-pointer"
                              data-id={setoran.id}
                              data-penyetor-id={setoran.penyetor_id}
                              data-penerima-id={setoran.penerima_id}
                            >
                              <i className="fas fa-check text-gray-400"></i>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="border border-gray-200 px-4 py-2 text-center text-sm"
                        data-label="Pesan"
                      >
                        {t('history.table.noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryTable;
