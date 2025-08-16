import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, ClipboardPen, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SlidingToggleSelect from '../ui/ToogleSledding';
import axios from 'axios';
import Alert from '../ui/Alert';
// import { useTranslation } from 'react-i18next';

interface ErrorLabel {
    id: number;
    key: string;
    value: string;
    color: string;
    status: number;
}

interface Form {
    setting_id: number;
    value: string,
    status: boolean
}

interface QuranHeaderProps {
    page: number;
    translateMode?: string;
    classNav?: string;
    target: string;
    errorLabels?: ErrorLabel[];
    settingUser?: Form[]
    onUpdateErrorLabels?: (newLabels: ErrorLabel[]) => void;
    setting?: boolean;
}

const QuranHeader: React.FC<QuranHeaderProps> = ({ page, translateMode = 'read', classNav = '', target, errorLabels, onUpdateErrorLabels, setting }) => {
    // const { t } = useTranslation();
    const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>('md');
    const [setoranType, setSetoranType] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null); // Ref for the sidebar itself
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [fontType, setFontType] = useState('Uthmanic');
    const [fontSize, setFontSize] = useState(5)
    const [editedAyatErrors, setEditedAyatErrors] = useState<ErrorLabel[]>([]);
    const [editedKataErrors, setEditedKataErrors] = useState<ErrorLabel[]>([]);
    const [editingAyatId, setEditingAyatId] = useState<number | null>(null);
    const [editingKataId, setEditingKataId] = useState<number | null>(null);
    const [kesimpulan, setKesimpulan] = useState<'tampilkan' | 'sembunyikan'>('tampilkan');
    const [tataLetak, setTataletak] = useState<'mushaf_ustmani' | 'fleksibel'>('fleksibel');
    const [kesimpulanId, setKesimpulanId] = useState<number | null>(null);
    const [alert, setAlert] = useState<boolean>(false);
    const [alertWaring, setAlertWaring] = useState<boolean>(false);
    const [alertReset, setAlertReset] = useState<boolean>(false);
    const [visibleAyat, setVisibleAyat] = useState<boolean>(true);
    const [visibleKata, setVisibleKata] = useState<boolean>(true);
    const [isMobile, setIsMobile] = useState(false);

    const ayatInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
    const kataInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    const viewOptions = [
        { value: 'IndoPak', label: 'Indopak' },
        { value: 'Uthmanic', label: 'Uthmanic' },
    ];

    useEffect(() => {
        const setoranData = localStorage.getItem('setoran-data');
        if (setoranData) {
            try {
                const { setoran_type } = JSON.parse(setoranData);
                setSetoranType(setoran_type);
            } catch (e) {
                console.error('Error parsing setoran data', e);
            }
        }

        // Check cookie for dark mode
        const nightModeCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('s_night_mode='));
        if (nightModeCookie) {
            const nightModeValue = nightModeCookie.split('=')[1];
            setIsDarkMode(nightModeValue === '1');
        }
    }, []);

    useEffect(() => {
        const updateScreenSize = () => {
            const width = window.innerWidth;
            if (width < 576) setScreenSize('xs');
            else if (width < 768) setScreenSize('sm');
            else if (width < 992) setScreenSize('md');
            else if (width < 1200) setScreenSize('lg');
            else if (width < 1400) setScreenSize('xl');
            else setScreenSize('xxl');
        };

        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Close sidebar if it's open and the click is outside the sidebar and not on the button that opens it
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isSidebarOpen) {
                // Ensure the click isn't on the button that toggles the sidebar
                const listButton = document.querySelector('.list-toggle-button'); // Add a class to your List button
                if (listButton && !listButton.contains(event.target as Node)) {
                    setIsSidebarOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]); // Re-run effect if isSidebarOpen changes

    // saveSettings
    useEffect(() => {
        errorLabels?.map((v) => {
            if (v.key == "font") {
                setFontType(v.value)
            } else if (v.key == "font-size") {
                setFontSize(parseInt(v.value, 10))
            } else if (v.key == "tata-letak") {
                setTataletak(v.value === 'mushaf_ustmani' ? 'mushaf_ustmani' : 'fleksibel');
            }
        })
        if (errorLabels) {
            setEditedAyatErrors(errorLabels.filter(e => e.key.startsWith('sa-')));
            setEditedKataErrors(errorLabels.filter(e => e.key.startsWith('sk-')));
        }
    }, [errorLabels, isSidebarOpen])

    useEffect(() => {
        if (errorLabels) {
            const kesimpulanLabel = errorLabels.find(e => e.key === 'kesimpulan');
            if (kesimpulanLabel) {
                setKesimpulan(kesimpulanLabel.value === 'tampilkan' ? 'tampilkan' : 'sembunyikan');
                setKesimpulanId(kesimpulanLabel.id);
            }
        }
    }, [errorLabels, isSidebarOpen]);

    const iconSize = {
        xs: 'text-base',
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-lg',
        xl: 'text-xl',
        xxl: 'text-2xl',
    }[screenSize];

    const textSize = {
        xs: 'text-[0.85rem]',
        sm: 'text-[0.9rem]',
        md: 'text-base',
        lg: 'text-base',
        xl: 'text-[1.1rem]',
        xxl: 'text-[1.2rem]',
    }[screenSize];

    const buttonSize = {
        xs: { padding: 'px-0 py-1', fontSize: 'text-xs' },
        sm: { padding: 'px-0 py-1', fontSize: 'text-sm' },
        md: { padding: 'px-0 py-1', fontSize: 'text-sm' },
        lg: { padding: 'px-0 py-1', fontSize: 'text-[0.9rem]' },
        xl: { padding: 'px-0 py-1', fontSize: 'text-base' },
        xxl: { padding: 'px-4 py-1', fontSize: 'text-[1.1rem]' },
    }[screenSize];

    const handleClick = () => {
        checkLocalStorage();
        if (checkLocalStorage()) return router.visit("/home");
        if (target) {
            console.log(target)
            router.visit(target);
        } else {
            router.visit("/result");
        }
    };

    const urlNow = window.location.pathname;
    const segments = urlNow.split('/').filter(Boolean);
    let displaySegment = segments[segments.length - 1];

    const getCurrentReadingInfo = () => {
        const setoranData = localStorage.getItem('setoran-data');
        if (setoranData) {
            try {
                const data = JSON.parse(setoranData);
                if (data.surah_number) {
                    return `Surah ${data.surah_number}`;
                } else if (data.juz_number) {
                    return `Juz ${data.juz_number}`;
                } else if (data.page_number) {
                    return `Page ${data.page_number}`;
                }
            } catch (e) {
                console.error('Error parsing setoran data', e);
            }
        }
        return null;
    };

    if (segments[0] === 'result') {
        const readingInfo = getCurrentReadingInfo();
        if (readingInfo) {
            displaySegment = `${setoranType || 'result'} / ${readingInfo}`;
        } else {
            displaySegment = setoranType || 'result';
        }
    } else if (segments[0] === 'surah' && segments[1]) {
        displaySegment = `Surah ${segments[1]}`;
    } else if (segments[0] === 'juz' && segments[1]) {
        displaySegment = `Juz ${segments[1]}`;
    } else if (segments[0] === 'page' && segments[1]) {
        displaySegment = `Page ${segments[1]}`;
    } else if (['dashboard', 'filter'].includes(displaySegment)) {
        displaySegment = displaySegment.charAt(0).toUpperCase() + displaySegment.slice(1);
    } else {
        displaySegment = '/';
    }

    const noFinishButton = () => {
        return ['dashboard', 'filter', 'result'].includes(segments[segments.length - 1]);
    };

    const changeFontSize = (key: string) => {
        if (key == "min") {
            if (fontSize == 1) return
            setFontSize((prev) => prev - 1)
        } else {
            if (fontSize == 10) return
            setFontSize((prev) => prev + 1)
        }
    }

    function getFontSizeClass() {
        return `${fontSize * 6}px`;
    }

    const handleAyatErrorChange = (id: number, newValue: string) => {
        setEditedAyatErrors(prev =>
            prev.map(e => e.id === id ? { ...e, value: newValue } : e)
        );
    };

    const handleKataErrorChange = (id: number, newValue: string) => {
        setEditedKataErrors(prev =>
            prev.map(e => e.id === id ? { ...e, value: newValue } : e)
        );
    };

    const handleAyatErrorStatusChange = (id: number, checked: boolean) => {
        setEditedAyatErrors(prev =>
            prev.map(e => e.id === id ? { ...e, status: checked ? 1 : 0 } : e)
        );
    };

    const handleKataErrorStatusChange = (id: number, checked: boolean) => {
        setEditedKataErrors(prev =>
            prev.map(e => e.id === id ? { ...e, status: checked ? 1 : 0 } : e)
        );
    };

    const handleAyatInputBlur = () => setEditingAyatId(null);
    const handleKataInputBlur = () => setEditingKataId(null);

    const handleAyatInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') setEditingAyatId(null);
    };
    const handleKataInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') setEditingKataId(null);
    };

    useEffect(() => {
        if (editingAyatId !== null && ayatInputRefs.current[editingAyatId]) {
            ayatInputRefs.current[editingAyatId]?.focus();
        }
    }, [editingAyatId]);

    useEffect(() => {
        if (editingKataId !== null && kataInputRefs.current[editingKataId]) {
            kataInputRefs.current[editingKataId]?.focus();
        }
    }, [editingKataId]);

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        // Cleanup saat unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);

    const handleSaveErrors = async () => {
        try {
            const allErrors = [...editedAyatErrors, ...editedKataErrors];

            // Ambil data awal
            const initialErrors = errorLabels || [];

            // Data font awal
            const initialFont = initialErrors.find(e => e.key === "font");
            const fontChanged = !initialFont || initialFont.value !== fontType;

            // Data font-size awal
            const initialFontSize = initialErrors.find(e => e.key === "font-size");
            const fontSizeChanged = !initialFontSize || parseInt(initialFontSize.value, 10) !== fontSize;

            // Data Tata Letak
            const initialTataLetak = initialErrors.find(e => e.key === "tata-letak");
            const tataLetakChanged = !initialTataLetak || initialTataLetak.value !== tataLetak;

            // Format perubahan font jika ada
            let fontError = null;
            if (fontChanged) {
                fontError = {
                    id: initialFont ? initialFont.id : Date.now(), // gunakan id dari errorLabels jika ada, jika tidak pakai timestamp
                    value: fontType,
                    status: true
                };
            }

            // Format perubahan font-size jika ada
            let fontSizeError = null;
            if (fontSizeChanged) {
                fontSizeError = {
                    id: initialFontSize ? initialFontSize.id : Date.now() + 1, // id unik jika tidak ada
                    value: fontSize.toString(),
                    status: true
                };
            }

            // Format perubahan tata letak jika ada
            let tataLetakError = null;
            if (tataLetakChanged) {
                tataLetakError = {
                    id: initialTataLetak ? initialTataLetak.id : Date.now() + 3, // id unik jika tidak ada
                    value: tataLetak,
                    status: true
                };
            }

            // Format perubahan kesimpulan jika ada
            let kesimpulanError = null;
            if (kesimpulanId !== null) {
                const initialKesimpulan = initialErrors.find(e => e.key === 'kesimpulan');
                if (!initialKesimpulan || initialKesimpulan.value !== kesimpulan) {
                    kesimpulanError = {
                        id: kesimpulanId,
                        value: kesimpulan,
                        status: true
                    };
                }
            } else {
                kesimpulanError = {
                    id: Date.now() + 2,
                    value: kesimpulan,
                    status: true
                };
            }

            // Filter hanya yang berubah
            const changed = allErrors.filter(e => {
                const initial = initialErrors.find(init => init.id === e.id);
                return (
                    initial &&
                    (initial.value !== e.value || (initial.status === 1) !== (e.status === 1))
                );
            });

            // Gabungkan perubahan font dan font-size jika ada
            const formatted = [
                ...changed.map(e => ({
                    id: e.id,
                    value: e.value,
                    status: e.status === 1
                })),
                ...(fontError ? [fontError] : []),
                ...(fontSizeError ? [fontSizeError] : []),
                ...(kesimpulanError ? [kesimpulanError] : []),
                ...(tataLetakError ? [tataLetakError] : [])
            ];
            if (formatted.length === 0) {
                setAlertWaring(true);
            } else {
                setAlert(true);
            }
            const response = await axios.post('/setting', formatted);
            if (onUpdateErrorLabels) {
                onUpdateErrorLabels(response.data.updatedLabels);
            }
            // alert("data Berhasil disimpan");
        } catch (error) {
            console.log(error.response?.data || error.message);
        }
    };

    const handleReset = async () => {
        try {
            const response = await axios.post('/setting/reset');
            if (onUpdateErrorLabels) {
                onUpdateErrorLabels(response.data.updatedLabels);
            }
            setAlertReset(true);
        } catch (error) {
            console.log(error);

        }
    }

    function checkLocalStorage() {
        const setoranData = localStorage.getItem('setoran-data');
        if (!setoranData) {
            return true;
        }

        const parsedData = JSON.parse(setoranData);

        // Daftar key yang wajib ada
        const requiredKeys = [
            'penyetor',
            'selectedFriend',
            'selectedGroup',
            'display',
            'setoran',
            'tampilkan'
        ];

        // Jika ada key yang hilang
        for (const key of requiredKeys) {
            if (!(key in parsedData)) {
                localStorage.removeItem('setoran-data');
                return true;
            }
        }

        // Validasi logika penyetor
        if (parsedData.penyetor === 'grup') {
            // Jika penyetor grup, selectedFriend harus kosong dan selectedGroup harus ada
            if (parsedData.selectedFriend || !parsedData.selectedGroup) {
                localStorage.removeItem('setoran-data');
                return true;
            }
        } else {
            // Jika penyetor bukan grup, selectedGroup harus kosong dan selectedFriend harus ada
            if (parsedData.selectedGroup || !parsedData.selectedFriend) {
                localStorage.removeItem('setoran-data');
                return true;
            }
        }
        return false;
    }

    return (
        <div className={`px-0 ${classNav} fixed z-50 w-full bg-neutral-100 text-black dark:bg-gray-800 dark:text-white shadow-md`}>
            <div className="mx-5 my-3 grid grid-cols-3">
                <div className="flex items-center">
                    <div className="cursor-pointer" onClick={() => (router.visit("/home"))}>
                        <FontAwesomeIcon icon={faHome} className={`${iconSize} ${isDarkMode ? 'text-gray-300' : 'text-[#2CA4AB]'}`} />
                    </div>
                    <span className={`ml-1 ${textSize} dark:text-gray-300`}>/ {displaySegment}</span>
                </div>
                {translateMode === 'read' && (
                    <div className="flex w-auto  items-center justify-center text-center" >
                        {!noFinishButton() && (
                            <span className={`px-3 py-1 ${buttonSize.fontSize} rounded bg-blue-500 font-bold text-white cursor-pointer`} onClick={handleClick}>
                                Selesai
                            </span>
                        )}
                    </div>
                )}
                {setting ? (
                    <div
                        className="flex items-center justify-end min-w-min  text-center list-toggle-button"
                    >
                        <span className={`${buttonSize.padding} ${buttonSize.fontSize} mr-0 rounded font-bold text-white cursor-pointer`} onClick={() => { setIsSidebarOpen(!isSidebarOpen); }}>
                            <Settings className='text-black dark:text-white' />
                        </span>
                    </div>
                ) : (
                    <div className='w-[50px]'></div>
                )}

                {/* Overlay transisi untuk efek fade */}
                {isSidebarOpen && (
                    <div
                        className={`fixed inset-0 bg-[rgba(39,39,39,0.53)] transition-opacity duration-300 z-40`}
                        onClick={() => {
                            setIsSidebarOpen(false)
                            setAlertWaring(false)
                            setAlert(false)
                            setAlertReset(false);
                        }}
                    />
                )}

                {/* Sidebar Container - Berbeda style untuk desktop dan mobile */}
                <div
                    className={`
                    fixed bg-white dark:bg-[#1F2125] transition-all duration-400 ease-in-out z-50
                    ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    ${isMobile
                            ? 'inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]' // Tinggi maksimal untuk mobile
                            : 'top-0 bottom-0 right-0 sm:w-[55%] lg:w-[35%]' // Desktop: side panel
                        }
                    ${isMobile
                            ? isSidebarOpen ? 'translate-y-0' : 'translate-y-full' // Mobile animation
                            : isSidebarOpen ? 'translate-x-0' : 'translate-x-full' // Desktop animation
                        }
                    flex flex-col
                `}
                    ref={sidebarRef}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header - tetap di atas */}
                    <div className="sticky top-0 z-10 bg-inherit border-b border-gray-400 flex-shrink-0">
                        <div className="flex justify-between items-center px-4 py-3">
                            <h1 className="text-[1.2rem] font-bold dark:text-white">Setting User</h1>
                            {isMobile && (
                                <button
                                    className="text-gray-400 hover:text-gray-200 text-2xl"
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content area - scrollable */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="w-full p-4">
                            <div>
                                <h1>Jenis Font</h1>
                                <div className="flex justify-center my-5">
                                    <SlidingToggleSelect
                                        options={viewOptions}
                                        selectedValue={fontType}
                                        onSelect={setFontType}
                                        className={`${isMobile ? 'w-full' : 'w-[300px]'}`}
                                    />
                                </div>
                            </div>
                            <div className='flex justify-between items-center'>
                                <h1>Ukuran Font</h1>
                                <div className='flex w-[100px] justify-between items-center'>
                                    <span className='text-[1.3rem] cursor-pointer' onClick={() => {
                                        changeFontSize("min")
                                    }}>-</span>
                                    <span className='inline-block w-[30px] h-[25px] rounded-xl bg-gray-500 text-center text-white'>{fontSize}</span>
                                    <span className='text-[1.3rem] cursor-pointer' onClick={() => {
                                        changeFontSize("plus")
                                    }}>+</span>
                                </div>
                            </div>
                            <div className={`flex mt-5 justify-center items-center ${fontType == "IndoPak" ? "font-arabic-indopak" : "qpc"}`}
                                style={{
                                    fontSize: getFontSizeClass()
                                }}
                            >
                                {
                                    fontType == "IndoPak" ? "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ" : "ﭑ ﭒ ﭓ ﭔ"
                                }
                            </div>
                            <div className='mt-7'>
                                <h1>Tata Letak</h1>
                                <div className='flex w-full justify-evenly items-center mt-4'>
                                    <div className='flex items-center gap-2'>
                                        <input
                                            id='fleksibel'
                                            type="radio"
                                            name="tata-letak"
                                            checked={tataLetak === 'fleksibel'}
                                            onChange={() => setTataletak('fleksibel')}
                                        />
                                        <label htmlFor='fleksibel'>Fleksibel</label>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <input
                                            id='mushaf_ustmani'
                                            type="radio"
                                            name="tata-letak"
                                            checked={tataLetak === 'mushaf_ustmani'}
                                            onChange={() => setTataletak('mushaf_ustmani')}
                                        />
                                        <label htmlFor='mushaf_ustmani'>Mushaf Utsmani</label>
                                    </div>
                                </div>
                            </div>
                            <div className='mt-7'>
                                <h1>Kesimpulan Per Halaman</h1>
                                <div className='flex w-full justify-evenly items-center mt-4'>
                                    <div className='flex items-center gap-2'>
                                        <input
                                            id='tampilkan'
                                            type="radio"
                                            name="perHalaman"
                                            checked={kesimpulan === 'tampilkan'}
                                            onChange={() => setKesimpulan('tampilkan')}
                                        />
                                        <label htmlFor='tampilkan'>Tampilkan</label>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <input
                                            id='sembunyikan'
                                            type="radio"
                                            name="perHalaman"
                                            checked={kesimpulan === 'sembunyikan'}
                                            onChange={() => setKesimpulan('sembunyikan')}
                                        />
                                        <label htmlFor='sembunyikan'>Sembunyikan</label>
                                    </div>
                                </div>
                            </div>
                            <div className={`mt-5 ${isMobile ? 'mb-20' : 'mb-10'}`}>
                                {/* Ayat */}
                                <div className='flex w-full items-center justify-between mb-3'>
                                    <h1 className='mb-2 font-bold border-b pb-1 text-lg text-gray-700 dark:text-gray-200'>Kesalahan Ayat</h1>
                                    <div onClick={() => {
                                        setVisibleAyat((prev) => !prev)
                                    }}>
                                        <ChevronDown className={`cursor-pointer transition-all duration-500 ease-in-out ${visibleAyat ? "rotate-180" : "rotate-0"}`} />
                                    </div>
                                </div>
                                <div className='relative overflow-hidden'>
                                    <div className={`w-[90%] mx-auto text-black transition-all duration-500 ease-in-out ${visibleAyat ? 'max-h-0' : 'max-h-[1000px]'}`}>
                                        {editedAyatErrors.map((err) => (
                                            <div
                                                key={err.id}
                                                className='flex items-center mb-3 gap-2 rounded-lg px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-700 transition-all'
                                                style={{ background: err.color || '#f7fafc' }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={err.status === 1}
                                                    onChange={e => handleAyatErrorStatusChange(err.id, e.target.checked)}
                                                    className="w-5 h-5 accent-blue-500 transition-all"
                                                />
                                                <input
                                                    type="text"
                                                    ref={el => ayatInputRefs.current[err.id] = el}
                                                    value={err.value}
                                                    disabled={editingAyatId !== err.id}
                                                    onChange={e => handleAyatErrorChange(err.id, e.target.value)}
                                                    onBlur={handleAyatInputBlur}
                                                    onKeyDown={handleAyatInputKeyDown}
                                                    style={{
                                                        background: 'transparent',
                                                        border: editingAyatId === err.id ? '1px solid #3b82f6' : 'none',
                                                        outline: 'none',
                                                        cursor: editingAyatId === err.id ? 'text' : 'pointer',
                                                        color: '#222'
                                                    }}
                                                    className={`w-full text-sm px-2 py-1 rounded transition-all ${editingAyatId === err.id ? 'bg-white shadow focus:ring-2 focus:ring-blue-400' : 'bg-transparent'}`}
                                                />
                                                <ClipboardPen
                                                    className='cursor-pointer text-gray-500 hover:text-blue-500 transition-all'
                                                    onClick={() => setEditingAyatId(err.id)}
                                                    size={20}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Kata */}
                                <div className='flex w-full items-center justify-between mb-3'>
                                    <h1 className='mb-2 mt-6 font-bold border-b pb-1 text-lg text-gray-700 dark:text-gray-200'>Kesalahan Kata</h1>
                                    <div onClick={() => {
                                        setVisibleKata((prev) => !prev)
                                    }}>
                                        <ChevronDown className={`cursor-pointer transition-all duration-500 ease-in-out ${visibleKata ? "rotate-180" : "rotate-0"}`} />
                                    </div>
                                </div>
                                <div className='relative overflow-hidden'>
                                    <div className={`w-[90%] mx-auto text-black transition-all duration-500 ease-in-out ${visibleKata ? 'max-h-0' : 'max-h-[1000px]'}`}>
                                        {editedKataErrors.map((err) => (
                                            <div
                                                key={err.id}
                                                className='flex items-center mb-3 gap-2 rounded-lg px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-700 transition-all'
                                                style={{ background: err.color || '#f7fafc' }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={err.status === 1}
                                                    onChange={e => handleKataErrorStatusChange(err.id, e.target.checked)}
                                                    className="w-5 h-5 accent-blue-500 transition-all"
                                                />
                                                <input
                                                    type="text"
                                                    ref={el => kataInputRefs.current[err.id] = el}
                                                    value={err.value}
                                                    disabled={editingKataId !== err.id}
                                                    onChange={e => handleKataErrorChange(err.id, e.target.value)}
                                                    onBlur={handleKataInputBlur}
                                                    onKeyDown={handleKataInputKeyDown}
                                                    style={{
                                                        background: 'transparent',
                                                        border: editingKataId === err.id ? '1px solid #3b82f6' : 'none',
                                                        outline: 'none',
                                                        cursor: editingKataId === err.id ? 'text' : 'pointer',
                                                        color: '#222'
                                                    }}
                                                    className={`w-full text-sm px-2 py-1 rounded transition-all ${editingKataId === err.id ? 'bg-white shadow focus:ring-2 focus:ring-blue-400' : 'bg-transparent'}`}
                                                />
                                                <ClipboardPen
                                                    className='cursor-pointer text-gray-500 hover:text-blue-500 transition-all'
                                                    onClick={() => setEditingKataId(err.id)}
                                                    size={20}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className='relative'>
                                </div>
                                <div className='flex gap-2 mt-6 justify-center'>
                                    <button className='px-4 py-1 rounded bg-gray-400 text-white hover:bg-gray-500 transition-all shadow' onClick={() => {
                                        setIsSidebarOpen(false);
                                        handleReset();
                                    }}>Reset</button>
                                    <button className='px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-all shadow' onClick={() => {
                                        setIsSidebarOpen(false);
                                        handleSaveErrors()
                                    }}>Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Alert show={alert} setAlert={setAlert} to={null} status='success' heading='Berhasil' message='Data Berhasil Disimpan' />
            <Alert show={alertWaring} setAlert={setAlertWaring} to={null} status='warning' heading='Peringatan' message='Tidak Ada Perubahan' />
            <Alert show={alertReset} setAlert={setAlertReset} to={null} status='success' heading='Berhasil' message='Data Berhasil Direset' />

        </div>
    );
};

export default QuranHeader;
