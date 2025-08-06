import React, { useEffect, useRef, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface DataItem {
    id: number;
    recipient: string;
    recipient_username: string;
    recite: string;
    reciter: string;
    reciter_username: string;
    results: string;
    signature: number;
    time: string;
}

interface FilterOptions {
    recipient?: string;
    reciter?: string;
    result?: string;
    timeRange?: {
        start?: string;
        end?: string;
    };
    signature?: string;
}

interface FilterPopupProps {
    isOpenProps: boolean;
    setOpenProps?: (isOpen: boolean) => void;
    initialFilters: FilterOptions; // Tambahkan ini
}

const FilterPopup: React.FC<FilterPopupProps> = ({ isOpenProps, setOpenProps, initialFilters }) => {
    const [isOpen, setIsOpen] = useState(isOpenProps);
    const { t } = useTranslation("table");
    const [filters, setFilters] = useState<FilterOptions>({
        recipient: initialFilters.recipient || '',
        reciter: initialFilters.reciter || '',
        result: initialFilters.result || '',
        timeRange: {
            start: initialFilters.timeRange?.start || '',
            end: initialFilters.timeRange?.end || ''
        },
        signature: initialFilters.signature || ''
    });

    const el = useRef<HTMLDivElement>(null);
    const resultOptions = ['Excellent', 'Very Good', 'Good', 'Pass', 'Weak', 'Not Pass'];

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (filters.recipient || filters.reciter || filters.result || filters.timeRange?.start || filters.timeRange?.end || filters.signature) {
            timeoutId = setTimeout(() => {
                handleApply();
            }, 100);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);

    // Satu useEffect untuk menangani semua side effects
    useEffect(() => {
        setIsOpen(isOpenProps);

        const handleClickOutside = (event: MouseEvent) => {
            if (el.current && !el.current.contains(event.target as Node)) {
                closePopup();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpenProps]);

    const closePopup = () => {
        setIsOpen(false);
        setOpenProps?.(false);
    };

    const saveFilters = (newFilters: FilterOptions) => {
        try {
            localStorage.setItem('filters', JSON.stringify(newFilters));
        } catch (error) {
            console.error('Error saving filters:', error);
        }
    };

    const handleApply = () => {
        saveFilters(filters);

        router.visit(`/home`, {
            method: 'get',
            data: {
                ...filters
            },
            preserveState: true,
            preserveScroll: true,
            replace: true
        });

        closePopup();
    };

    const handleReset = () => {
        const resetFilters = {
            recipient: '',
            reciter: '',
            result: '',
            timeRange: { start: '', end: '' },
            signature: '',
        };

        setFilters(resetFilters);
        localStorage.removeItem('filters');

        router.visit('/home', {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });

        closePopup();
    };

    // Handle body overflow
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <div>
            {
                isOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 dark:bg-black/70">
                        <div className="bg-white dark:bg-[#262D34] dark:text-white rounded-md shadow-lg border border-gray-200 w-80 dark:border-gray-600" ref={el}>
                            <div className="p-4">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium text-gray-900 dark:text-white">Filter Options</h3>
                                    <button onClick={() => {
                                        setIsOpen(false)
                                        if (setOpenProps) {
                                            setOpenProps(false);
                                        }
                                    }} className="text-gray-400 hover:text-gray-500 cursor-pointer">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Reciter Filter */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">{t("history.table.reciter")}</label>
                                    <input
                                        type="text"
                                        className="block dark:bg-[#30363c] w-full rounded-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm placeholder:text-md py-2 px-3"
                                        placeholder="Filter by reciter..."
                                        value={filters.reciter || ''}
                                        onChange={(e) => setFilters({ ...filters, reciter: e.target.value })}
                                    />
                                </div>

                                {/* Result Filter */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">{
                                        t("history.table.results")
                                    }</label>
                                    <select
                                        className="block dark:bg-[#30363c] w-full rounded-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm placeholder:text-md py-2 px-3"
                                        value={filters.result || ''}
                                        onChange={(e) => setFilters({ ...filters, result: e.target.value || undefined })}
                                    >
                                        <option value="">{t("history.table.allResults")}</option>
                                        {resultOptions.map(option => (
                                            <option key={option} value={option}>{t(`history.table.ratings.${option}`)}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Time Range */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">From</label>
                                        <input
                                            type="date"
                                            className="block w-full dark:bg-[#30363c] rounded-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm placeholder:text-md py-2 px-3   "
                                            value={filters.timeRange?.start || ''}
                                            onChange={(e) => setFilters({
                                                ...filters,
                                                timeRange: {
                                                    ...filters.timeRange,
                                                    start: e.target.value
                                                }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">To</label>
                                        <input
                                            type="date"
                                            className="block w-full dark:bg-[#30363c] rounded-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm placeholder:text-md py-2 px-3"
                                            value={filters.timeRange?.end || ''}
                                            onChange={(e) => setFilters({
                                                ...filters,
                                                timeRange: {
                                                    ...filters.timeRange,
                                                    end: e.target.value
                                                }
                                            })}
                                        />
                                    </div>
                                </div>

                                {/* Signature Status */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">{t("history.table.signature")}</label>
                                    <select
                                        className="block w-full dark:bg-[#30363c] rounded-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm placeholder:text-md py-2 px-3"
                                        value={filters.signature || ''}
                                        onChange={(e) => setFilters({ ...filters, signature: e.target.value || undefined })}
                                    >
                                        <option value="">{t("history.table.allSignatures")}</option>
                                        <option value="1">{t("history.table.withSignature")}</option>
                                        <option value="0">{t("history.table.withoutSignature")}</option>
                                    </select>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={handleReset}
                                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleApply}
                                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default FilterPopup;
