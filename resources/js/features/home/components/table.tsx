import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Check, Filter, Grid2X2, SquareActivity } from 'lucide-react';
import React, { useState } from 'react'; // Import useEffect
import { useTranslation } from 'react-i18next';
import PopUp from '../../../components/ui/PopUp';
import AdvancedTableFilter from '@/components/layouts/filter';

interface LinkData {
    url: string | null;
    label: string;
    active: boolean;
}
interface Meta {
    current_page: number;
    has_more_pages: boolean;
    last_page: number;
    links: LinkData[];
    per_page: number;
    total: number;
}
interface FilterData {
    reciter: string | null;
    result: string | null;
    signature: string | null; // Atau number | null, tergantung pada tipe data yang digunakan
    timeRange: string | null;
}
interface Data {
    id: number;
    recipient: string;
    recipient_username: string;
    recite: string;
    reciter: string;
    reciter_id: number;
    reciter_username: string;
    results: string;
    signature: number;
    time: string;
}
interface Setoran {
    data: Data[];
    meta: Meta;
    filters: FilterData;
}
interface HistoryTableProps {
    fluidDesign: boolean;
    setoran: Setoran;
}

const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const day = date.getDate();
    const monthNames = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
    const month = ucfirst(monthNames[date.getMonth()]);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${hours}.${minutes}`;
};

const ucfirst = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const config = {
    PARENT_WEB: import.meta.env.VITE_PARENT_URL,
};

const HistoryTable: React.FC<HistoryTableProps> = ({ fluidDesign, setoran }) => {
    const { t } = useTranslation('table');
    const [showPopUp, setShowPopUp] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const fetchSetoranDetails = async (id: number) => {
        try {
            const response = await axios.get(`/setoran/${id}`);
            let setoranData = {
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
                tampilan: response.data.tampilan
            };
            if (response.data.tampilan === 'page' || response.data.tampilan === 'juz') {
                const awalSurah = response.data.info?.split('-')[0];
                const akhirSurah = response.data.info?.split('-')[2];
                const awalAyat = response.data.info?.split('-')[1];
                const akhirAyat = response.data.info?.split('-')[3];
                setoranData = {
                    ...setoranData,
                    surah: {
                        id: response.data.nomor?.toString() || '',
                        name: response.data.surah_name || '',
                        from: `${awalSurah},${awalAyat}`,
                        to: `${akhirSurah},${akhirAyat}`
                    },
                };
            }

            localStorage.setItem('setoran-data', JSON.stringify(setoranData));
            router.visit('/recap', {
                data: {
                    id_setoran: id
                }
            });
        } catch (error) {
            console.error('Error:', error);
            alert(t('error.fetch_failed'));
        }
    };

    const openUserProfile = (username: string) => {
        window.open(`${config.PARENT_WEB}/${username}`, '_blank');
    };

    const handleSign = async (id: number) => {
        await axios.post(`/setoran/${id}/sign`);
        router.reload({ only: ['setoran'] });
        setShowPopUp(false);
    };

    const generatePaginationLinks = (currentPage: number, lastPage: number, links: LinkData[]) => {
        const pages = [];
        const delta = 1; // Kurangi delta menjadi 1 untuk tampilan lebih ringkas

        // Tambah Previous jika ada
        const prevLink = links.find((link: LinkData) => link.label.includes('Previous'));
        if (prevLink && prevLink.url) {
            pages.push({ label: `<`, url: prevLink.url, active: prevLink.active });
        }

        // Halaman pertama
        pages.push({ label: '1', url: links.find((l: LinkData) => l.label === '1')?.url, active: currentPage === 1 });

        // Jika current page jauh dari awal, tambah ellipsis
        if (currentPage - delta > 2) {
            pages.push({ label: '...', url: null, active: false });
        }

        // Halaman di sekitar current page
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(lastPage - 1, currentPage + delta); i++) {
            if (i < currentPage + delta + 1) {
                pages.push({
                    label: i.toString(),
                    url: links.find((l: LinkData) => l.label == i.toString())?.url,
                    active: currentPage === i
                });
            }
        }

        // Jika current page jauh dari akhir, tambah ellipsis
        if (currentPage + delta < lastPage - 1) {
            pages.push({ label: '...', url: null, active: false });
        }

        // Halaman terakhir (jika bukan halaman pertama)
        if (lastPage > 1) {
            pages.push({
                label: lastPage.toString(),
                url: links.find((l: LinkData) => l.label === lastPage.toString())?.url,
                active: currentPage === lastPage
            });
        }

        // Tambah Next jika ada
        const nextLink = links.find((link: LinkData) => link.label.includes('Next'));
        if (nextLink && nextLink.url) {
            pages.push({ label: `>`, url: nextLink.url, active: nextLink.active });
        }

        return pages;
    };

    const paginationLinks = generatePaginationLinks(setoran.meta.current_page, setoran.meta.last_page, setoran.meta.links);
    console.log(setoran);
    return (
        <div className={fluidDesign ? 'mt-0 w-full' : 'mx-auto mt-3 w-full max-w-4xl'}>
            <div className="flex w-full justify-center">
                <div className="w-full overflow-x-auto">
                    <div className={`rounded-lg bg-white p-6 shadow-lg dark:bg-[rgb(38,45,52)]`}>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className={`text-2xl font-semibold text-gray-800 dark:text-white`}>{t('history.title')}</h2>
                            <div className="flex gap-2">
                                <button
                                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                                    aria-label={t('history.table.table_view')}
                                    onClick={() => (window.location.href = '/dashboard')}
                                >
                                    <SquareActivity size={20} />
                                </button>
                                <button
                                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                                    title="Qurani Setting"
                                    aria-label="Settings"
                                    onClick={() => (window.location.href = '/filter')}
                                >
                                    <Grid2X2 size={20} />
                                </button>
                                {/* Pastikan AdvancedTableFilter memanggil applyFilters dengan filter yang benar */}
                                <button
                                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                                    onClick={() => {
                                        setIsOpen(true);
                                    }}
                                    aria-label="Open filters"
                                >
                                    <Filter size={20} />
                                </button>
                            </div>
                        </div>

                        <table className="hidden w-full border-collapse border-[1px] dark:border-gray-500 md:table">
                            <thead>
                                <tr className={`bg-gray-100 dark:bg-gray-800`}>
                                    {['time', 'reciter', 'recipient', 'recite', 'results', 'signature'].map((header) => (
                                        <th
                                            key={header}
                                            className={`text-gray-700 border border-gray-600 px-4 py-2 text-left font-medium dark:border-gray-500 dark:text-gray-200 dark:bg-[#212529]`}
                                        >
                                            {t(`history.table.${header}`)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Gunakan filteredData di sini */}
                                {setoran.data.length > 0 ? (
                                    setoran.data.map((item: Data, i: number) => (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-[#888888] hover:text-white dark:hover:bg-gray-700  cursor-pointer ${i % 2 === 1 ? "dark:bg-[#212529] bg-gray-200" : "dark:bg-[#323539]"}`}
                                            onClick={() => {
                                                fetchSetoranDetails(item.id)
                                            }}
                                        >
                                            {['time', 'reciter', 'recipient', 'recite', 'results', 'signature'].map((col) => {
                                                const value = (() => {
                                                    switch (col) {
                                                        case 'time':
                                                            return formatTime(item.time);
                                                        case 'reciter':
                                                            return item.reciter;
                                                        case 'recipient':
                                                            return item.recipient;
                                                        case 'recite':
                                                            return item.recite;
                                                        case 'results':
                                                            return t(`history.table.ratings.${item.results}`, item.results)?.toString();
                                                        case 'signature':
                                                            return (
                                                                <div className="grid place-items-center">
                                                                    <Check
                                                                        size={20}
                                                                        className={
                                                                            item.signature === 0
                                                                                ? `cursor-pointer text-gray-400 dark:hover:text-blue-300 hover:text-blue-300 dark:text-gray-400`
                                                                                : 'text-blue-500'
                                                                        }
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (item.signature === 0) {
                                                                                setSelectedId(item.id);
                                                                                setShowPopUp(true);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            );
                                                        default:
                                                            return '';
                                                    }
                                                })();

                                                const tdClass = `border px-4 py-2 text-sm dark:border-gray-500 dark:text-gray-200 border-gray-600 text-gray-700'} ${col === 'reciter' || col === 'recipient' ? 'hover:underline' : ''
                                                    }`;

                                                return (
                                                    <td
                                                        key={col}
                                                        className={tdClass}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (col === 'reciter') openUserProfile(item.reciter_username);
                                                            else if (col === 'recipient') {
                                                                openUserProfile(item.recipient_username);
                                                            } else {
                                                                fetchSetoranDetails(item.id);
                                                            }
                                                        }}
                                                    >
                                                        {value}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className={`text-gray-600'} border border-gray-200 px-4 py-2 text-center text-sm text-gray-300 dark:border-gray-600`}
                                        >
                                            {t('history.table.noData')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="hidden gap-2 justify-center mt-4 md:flex">
                            {paginationLinks.map((link, index) => {
                                // Untuk link 'Previous' dan 'Next', atau '...'
                                if (link.url === null) {
                                    return (
                                        <span key={index} className="px-3 py-1 text-gray-400 select-none">
                                            {link.label}
                                        </span>
                                    );
                                }

                                return (
                                    <Link
                                        key={index}
                                        href={link.url ?? "#"}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded ${link.active ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                                            }`}
                                        preserveScroll
                                        preserveState
                                    />
                                );
                            })}
                        </div>

                        {/* Mobile View */}
                        <div className="block w-full md:hidden mb-14">
                            {/* Gunakan filteredData di sini */}
                            {setoran.data.length > 0 ? (
                                setoran.data.map((item: Data) => (
                                    <table
                                        key={item.id}
                                        className={`w-full border-collapse mb-3 border-b-2 dark:border-gray-600 pb-52`}
                                    // onClick={() => fetchSetoranDetails(item.id)}
                                    >
                                        <tbody>
                                            {['time', 'reciter', 'recipient', 'recite', 'results', 'signature'].map((col) => {
                                                const value = (() => {
                                                    switch (col) {
                                                        case 'time':
                                                            return formatTime(item.time);
                                                        case 'reciter':
                                                            return item.reciter;
                                                        case 'recipient':
                                                            return item.recipient;
                                                        case 'recite':
                                                            return item.recite;
                                                        case 'results':
                                                            return t(`history.table.ratings.${item.results}`, item.results)?.toString();
                                                        case 'signature':
                                                            return (
                                                                <Check
                                                                    size={20}
                                                                    className={
                                                                        item.signature === 0
                                                                            ? `inline-block cursor-pointer text-gray-400 hover:text-gray-200 hover:text-gray-600 dark:text-gray-400`
                                                                            : 'inline-block text-blue-500'
                                                                    }
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (item.signature === 0) {
                                                                            setSelectedId(item.id);
                                                                            setShowPopUp(true);
                                                                        }
                                                                    }}
                                                                />
                                                            );
                                                        default:
                                                            return '';
                                                    }
                                                })();

                                                const tdClassLeft = `px-2 py-1 text-sm font-medium dark:text-gray-200 text-gray-700 w-1/4  dark:border-gray-600`;
                                                const tdClassRight = `px-2 py-1 text-sm dark:text-gray-200 text-gray-700 w-2/3 break-words ${col === 'reciter' || col === 'recipient' ? 'underline text-blue-500' : ''}`;

                                                return (
                                                    <tr key={col} >
                                                        <td className={tdClassLeft}>{t(`history.table.${col}`)}</td>
                                                        <td
                                                            className={tdClassRight}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (col === 'reciter') { openUserProfile(item.reciter_username) }
                                                                else if (col === 'recipient') {
                                                                    openUserProfile(item.recipient_username);
                                                                } else {
                                                                    // fetchSetoranDetails(item.id);
                                                                }
                                                            }}
                                                        >
                                                            :{' '}
                                                            {value}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            <tr>
                                                <td colSpan={2} className={"text-right"}>
                                                    {
                                                        <button className='text-white text-sm font-semibold text-center bg-blue-500 py-1 px-3 rounded-sm cursor-pointer w-full' onClick={() => {
                                                            fetchSetoranDetails(item.id)
                                                        }}>Detail</button>
                                                    }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><br /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ))
                            ) : (
                                <div
                                    className={`text-gray-600 border border-gray-200 px-4 py-2 text-center text-sm dark:text-gray-300 dark:border-gray-600`}
                                >
                                    {t('history.table.noData')}
                                </div>
                            )}
                            <div className="flex gap-2 justify-center mt-4 md:hidden text-[.7rem]">
                                {paginationLinks.map((link, index) => {
                                    // Untuk link 'Previous' dan 'Next', atau '...'
                                    if (link.url === null) {
                                        return (
                                            <span key={index} className="px-1 py-1 text-gray-400 select-none">
                                                {link.label}
                                            </span>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={index}
                                            href={link.url ?? "#"}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 rounded ${link.active ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                                                }`}
                                            preserveScroll
                                            preserveState
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showPopUp && selectedId && (
                <PopUp
                    isOpen={showPopUp}
                    onClose={() => setShowPopUp(false)}
                    onConfirm={() => handleSign(selectedId)}
                    message={t('history.confirmSignRecord')}
                />
            )}
            {/* filter advance */}
            <AdvancedTableFilter isOpenProps={isOpen} setOpenProps={setIsOpen} initialFilters={JSON.parse(localStorage.getItem('filters') || '{}')} />
        </div>
    );
};

export default HistoryTable;
