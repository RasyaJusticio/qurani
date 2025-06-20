import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface QuranHeaderProps {
    page: number;
    translateMode?: string;
    classNav?: string;
    target: string;
}

const RecapHeader: React.FC<QuranHeaderProps> = ({ page, translateMode = 'read', classNav = '', target }) => {
    const { t } = useTranslation();
    const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>('md');
    const [setoranType, setSetoranType] = useState('');

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
        xs: { padding: 'px-2 py-1', fontSize: 'text-xs' },
        sm: { padding: 'px-2 py-1', fontSize: 'text-sm' },
        md: { padding: 'px-3 py-1', fontSize: 'text-sm' },
        lg: { padding: 'px-3 py-1', fontSize: 'text-[0.9rem]' },
        xl: { padding: 'px-3 py-1', fontSize: 'text-base' },
        xxl: { padding: 'px-4 py-1', fontSize: 'text-[1.1rem]' },
    }[screenSize];

    const handleClick = () => {
            window.location.href = '/recap';
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
        return ['dashboard', 'filter', 'result','page','recap'].includes(segments[segments.length - 1]);
    };

    return (
        <div className={`px-6 ${classNav} fixed z-50 w-full bg-white`}>
            <div className="ml-3 mt-3 mb-3 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="cursor-pointer" onClick={() => (window.location.href = `/`)}>
                        <FontAwesomeIcon icon={faHome} className={`${iconSize} text-[#2CA4AB]`} />
                    </div>
                    <span className={`ml-1 ${textSize}`}>/ Recap</span>
                </div>
                {translateMode === 'read' && (
                    <div className="flex w-auto cursor-pointer items-center justify-center p-1 pe-10 text-center" onClick={handleClick}>
                        {!noFinishButton() && (
                            <span className={`${buttonSize.padding} ${buttonSize.fontSize} me-5 rounded bg-[#ff6500] font-bold text-white`}>
                                Selesai
                            </span>
                        )}
                    </div>
                )}
                <div className="flex cursor-text items-center">
                    <span className="invisible">Placeholder</span>
                </div>
            </div>
        </div>
    );
};

export default RecapHeader;
