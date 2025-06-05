import { Grid2X2, SquareActivity, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setupTranslations } from '@/features/i18n/i18n';

// Fungsi untuk memformat waktu menjadi "tgl-bulan waktu"
const formatTime = (timeString) => {
    const date = new Date(timeString);
    const day = date.getDate();
    const monthNames = [
        'januari', 'februari', 'maret', 'april', 'mei', 'juni',
        'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
    ];
    const month = monthNames[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}-${month} ${hours}.${minutes}`;
};

const HistoryTable = ({ fluidDesign, setoran }) => {
    const { t } = useTranslation('table');
    const [translationsReady, setTranslationsReady] = useState(false);

    useEffect(() => {
        const loadTranslations = async () => {
            await setupTranslations('table');
            setTranslationsReady(true);
        };
        loadTranslations();
    }, []);

    if (!translationsReady) return null;

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
                                    className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:cursor-pointer"
                                    aria-label={t('history.tableButtonLabel') || 'Table View'}
                                    onClick={() => (window.location.href = '/dashboard')}
                                >
                                    <SquareActivity size={20} />
                                </button>
                                <button
                                    className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:cursor-pointer"
                                    title={t('history.settingsButtonTitle') || 'Settings'}
                                    aria-label={t('history.settingsButtonLabel') || 'Settings'}
                                    onClick={() => (window.location.href = '/filter')}
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
                                {setoran && setoran.length > 0 ? (
                                    setoran.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                                                {formatTime(item.time)}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                                                {item.reciter}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                                                {item.recipient}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                                                {item.recite}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                                                {item.results}
                                            </td>
                                            <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                                                <Check
                                                    size={20}
                                                    className={item.signature === 0 ? 'text-gray-400' : 'text-gary-500'}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="border border-gray-200 px-4 py-2 text-center text-sm"
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
    );
};

export default HistoryTable;
