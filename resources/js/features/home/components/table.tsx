import { Inertia } from '@inertiajs/inertia';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Check, Grid2X2, SquareActivity } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setupTranslations } from '@/features/i18n/i18n';

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

const HistoryTable: React.FC<HistoryTableProps> = ({ fluidDesign, setoran }) => {
    const { t } = useTranslation('table');
    const [translationsReady, setTranslationsReady] = useState(false);

    useEffect(() => {
        const loadTranslations = async () => {
            await setupTranslations('table');
            setTranslationsReady(true);
        };
        loadTranslations();
    }, []);

    const fetchSetoranDetails = async (id: number) => {
        try {
            const response = await axios.get(`/setoran/${id}`);
            const setoranData = {
                reciter: {
                    user_id: response.data.penyetor?.username || '',
                    user_name: response.data.penyetor?.username || '',
                    full_name: response.data.penyetor?.fullname || '',
                },
                recipient: response.data.penerima?.fullname || '',
                setoran_type: response.data.setoran || '',
                surah_id: response.data.nomor?.toString() || '',
                surah: {
                    id: response.data.nomor?.toString() || '',
                    name: response.data.surah_name || '',
                    from: response.data.info?.split('-')[0] || '',
                    to: response.data.info?.split('-')[1] || '',
                },
                mistake: response.data.perhalaman || {},
                ket: response.data.ket || '',
                conclusion: response.data.hasil || '',
            };

            localStorage.setItem('setoran-data', JSON.stringify(setoranData));
            window.location.href = '/recap';
        } catch (error) {
            console.error('Error:', error);
            alert(t('error.fetch_failed'));
        }
    };

    const openUserProfile = (username: string) => {
        window.open(`${config.PARENT_WEB}/${username}`, '_blank');
    };

    const handleSign = async (id: number) => {
        try {
            await axios.post(`/setoran/${id}/sign`);
            console.log('bisa');
            router.reload({
                only: ['setoran'],
            });
        } catch (error) {
            console.error('Error signing:', error);
            alert(t('error.sign_failed'));
        }
    };

    if (!translationsReady) return null;

    return (
        <div className={fluidDesign ? 'mt-3 w-full' : 'mx-auto mt-3 w-full'}>
            <div className="flex w-full justify-center">
                <div className="w-full overflow-x-auto">
                    <div className="relative rounded-lg bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">{t('history.title')}</h2>
                            <div className="flex gap-2">
                                <button
                                    className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                    aria-label={t('history.table.table_view')}
                                    onClick={() => (window.location.href = '/dashboard')}
                                >
                                    <SquareActivity size={20} />
                                </button>
                                <button
                                    className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                    title={t('history.settingsButtonTitle')}
                                    aria-label={t('history.settingsButtonTitle')}
                                    onClick={() => (window.location.href = '/filter')}
                                >
                                    <Grid2X2 size={20} />
                                </button>
                            </div>
                        </div>

                        <table className="w-full border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    {['time', 'reciter', 'recipient', 'recite', 'results', 'signature'].map((header) => (
                                        <th key={header} className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                                            {t(`history.table.${header}`)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
  {setoran?.length > 0 ? (
    setoran.map((item) => (
      <tr key={item.id} className="cursor-pointer hover:bg-gray-50" onClick={() => fetchSetoranDetails(item.id)}>
        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">{formatTime(item.time)}</td>
        <td
          className="border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            openUserProfile(item.reciter_username);
          }}
        >
          {item.reciter}
        </td>
        <td
          className="border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            openUserProfile(item.recipient_username);
          }}
        >
          {item.recipient}
        </td>
        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">{item.recite}</td>
        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
          {t(`history.table.ratings.${item.results}`, item.results)?.toString()}
        </td>
        <td
          className="border border-gray-200 px-4 py-2 text-sm text-gray-600 flex justify-center items-center"
          onClick={(e) => {
            e.stopPropagation();
            if (item.signature === 0) {
              if (window.confirm(t('confirm.sign_record'))) {
                handleSign(item.id);
              }
            }
          }}
        >
          <Check
            size={20}
            className={
              item.signature === 0 ? 'cursor-pointer text-gray-400 hover:text-gray-600' : 'text-blue-500'
            }
          />
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={6} className="border border-gray-200 px-4 py-2 text-center text-sm text-gray-600">
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
    );
};

export default HistoryTable;