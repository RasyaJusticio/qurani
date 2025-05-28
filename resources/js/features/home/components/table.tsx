import React from 'react';

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

  const handleTableButtonClick = () => {
  };

  const handleSettingsButtonClick = () => {
    localStorage.setItem('activeTab', 'statistics');
  };

  return (
    <div className={fluidDesign ? 'w-full mt-3' : 'max-w-7xl mx-auto mt-3'}>
      <div className="flex justify-center">
        <div className="w-full overflow-x-auto">
          <div className="w-full">
            <div className="bg-white shadow-2xl p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <a href={`${systemUrl}`}>
                  <h3 className="text-2xl font-semibold text-left mb-0 hover:underline">History</h3>
                </a>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                    onClick={handleTableButtonClick}
                  >
                    <i className="fas fa-table"></i>
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                    id="settingsBtnHistory"
                    title="Qurani Setting"
                    onClick={handleSettingsButtonClick}
                  >
                    <i className="fas fa-chart-line"></i>
                  </button>
                </div>
              </div>
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Time</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Reciter</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Recipient</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Recite</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Results</th>
                    <th className="border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-700">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData && historyData.length > 0 ? (
                    historyData.map((setoran) => (
                      <tr key={setoran.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2 text-sm" data-label="Time">
                          <a
                            href={`${systemUrl}/qurani/riwayat/${setoran.id}`}
                            className="text-blue-600 hover:underline"
                            data-id={setoran.id}
                          >
                            {setoran.formatted_date}
                          </a>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm" data-label="Penyetor">
                          <span className="js_user-popover" data-uid={setoran.penyetor_id}>
                            <a
                              href={`${systemUrl}/${setoran.penyetor_name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline group relative"
                            >
                              {setoran.penyetor_name}
                              <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                                {setoran.penyetor_fullname || setoran.penyetor_name}
                              </span>
                            </a>
                          </span>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm" data-label="Penerima">
                          <a
                            href={`${systemUrl}/${setoran.penerima_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline group relative"
                          >
                            {setoran.penerima_name}
                            <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                              {setoran.penerima_fullname || setoran.penerima_name}
                            </span>
                          </a>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm" data-label="Setoran">
                          <a
                            href={`${systemUrl}/qurani/riwayat/${setoran.id}`}
                            className="text-blue-600 hover:underline"
                            data-id={setoran.id}
                          >
                            {setoran.setoran}
                          </a>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm" data-label="Hasil">
                          <a
                            href={`${systemUrl}/qurani/riwayat/${setoran.id}`}
                            className="text-blue-600 hover:underline"
                            data-id={setoran.id}
                          >
                            {setoran.hasil}
                          </a>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center text-sm" data-label="Paraf">
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
                      <td colSpan={6} className="border border-gray-200 px-4 py-2 text-center text-sm" data-label="Pesan">
                        Doesn't recite history
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
