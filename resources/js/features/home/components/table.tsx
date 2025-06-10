import { Inertia } from '@inertiajs/inertia';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Check, Grid2X2, SquareActivity } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../components/layouts/theme-context';


interface HistoryTableProps {
  fluidDesign: boolean;
  setoran: any[];
}

const formatTime = (timeString: string) => {
  const date = new Date(timeString);
  const day = date.getDate();
  const monthNames = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
  const month = monthNames[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}-${month} ${hours}.${minutes}`;
};

const config = {
  PARENT_WEB: import.meta.env.VITE_PARENT_URL,
};

const ucfirst = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const HistoryTable: React.FC<HistoryTableProps> = ({ fluidDesign, setoran }) => {
  const { isDarkMode } = useTheme();

  const fetchSetoranDetails = async (id: number) => {
    const response = await axios.get(`/setoran/${id}`);
    const setoranData = {
      reciter: {
        user_id: response.data.penyetor?.username || '',
        user_name: response.data.penyetor?.username || '',
        full_name: response.data.penyetor?.fullname || '',
      },
      recipient: response.data.penerima?.fullname || '',
      setoran_type: response.data.setoran || '',
      tampilan: response.data.tampilan || '',
      surah_id: response.data.nomor?.toString() || '',
      surah: {
        id: response.data.nomor?.toString() || '',
        name: response.data.surah_name || '',
        from: response.data.tampilan === 'surah' ? response.data.info?.split('-')[0] || '' : '',
        to: response.data.tampilan === 'surah' ? response.data.info?.split('-')[1] || '' : '',
        info: response.data.info,
        info_full: response.data.info_with_surah_names
      },
      mistake: response.data.perhalaman || {},
      ket: response.data.ket || '',
      conclusion: response.data.hasil || '',
      recite:
        response.data.tampilan === 'surah'
          ? `${ucfirst(response.data.setoran)} ${ucfirst(response.data.tampilan)} ${response.data.tampilan === 'surah' && response.data.surah_name ? response.data.surah_name : response.data.nomor}${response.data.tampilan === 'surah' ? ' Ayat ' + response.data.info : ''}`
          : `${ucfirst(response.data.setoran)} ${ucfirst(response.data.tampilan)} ${response.data.nomor}`,
    };
    localStorage.setItem('setoran-data', JSON.stringify(setoranData));
    window.location.href = '/recap';
  };

  const openUserProfile = (username: string) => {
    window.open(`${config.PARENT_WEB}/${username}`, '_blank');
  };

  const handleSign = async (id: number) => {
    await axios.post(`/setoran/${id}/sign`);
    router.reload({ only: ['setoran'] });
  };

  return (
    <div className={fluidDesign ? 'mt-3 w-full' : 'mx-auto mt-3 w-full'}>
      <div className="flex w-full justify-center">
        <div className="w-full overflow-x-auto">
          <div className={`relative rounded-lg p-6 shadow-lg ${isDarkMode ? 'bg-[rgb(38,45,52)]' : 'bg-white'}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>History</h2>
              <div className="flex gap-2">
                <button onClick={() => (window.location.href = '/dashboard')} className={`rounded-full p-2 transition-colors hover:cursor-pointer ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`} aria-label="Table View">
                  <SquareActivity size={20} />
                </button>
                <button title="Qurani Setting" onClick={() => (window.location.href = '/filter')} className={`rounded-full p-2 transition-colors hover:cursor-pointer ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`} aria-label="Settings">
                  <Grid2X2 size={20} />
                </button>
              </div>
            </div>

            <table className={`w-full border-collapse border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <thead>
                <tr className={`${isDarkMode ? 'bg-[rgb(48,55,62)]' : 'bg-gray-100'}`}>
                  {['Time', 'Reciter', 'Recipient', 'Recite', 'Results', 'Signature'].map((header) => (
                    <th key={header} className={`border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} px-4 py-2 text-left text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {setoran.length > 0 ? (
                  setoran.map((item) => (
                    <tr key={item.id} className={`cursor-pointer hover:${isDarkMode ? 'bg-[rgb(48,55,62)]' : 'bg-gray-50'}`} onClick={() => fetchSetoranDetails(item.id)}>
                      <td className={`border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{formatTime(item.time)}</td>
                      <td className={`border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:underline`} onClick={(e) => { e.stopPropagation(); openUserProfile(item.reciter_username); }}>
                        {item.reciter}
                      </td>
                      <td className={`border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:underline`} onClick={(e) => { e.stopPropagation(); openUserProfile(item.recipient_username); }}>
                        {item.recipient}
                      </td>
                      <td className={`border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.recite}</td>
                      <td className={`border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.results}</td>
                      <td className={`border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} px-4 py-2 text-sm flex justify-center items-center`} onClick={(e) => { e.stopPropagation(); if (item.signature === 0 && window.confirm('Confirm to sign this record?')) handleSign(item.id); }}>
                        <Check size={20} className={item.signature === 0 ? `cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}` : 'text-blue-500'} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={`border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} px-4 py-2 text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
  );
};

export default HistoryTable;
