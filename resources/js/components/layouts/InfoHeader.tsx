import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';

interface Chapter {
    id : number,
    name_simple : string
}

interface QuranHeaderProps {
    chapter: Chapter;
    translateMode?: string;
    classNav?: string;
}

const InfoHeader: React.FC<QuranHeaderProps> = ({ chapter, translateMode = 'read', classNav = '' }) => {
    // const { t } = useTranslation();
    const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>('md');

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
        window.history.back()
    };


    return (
        <div className={`px-0 ${classNav} fixed z-50 w-full bg-neutral-100 text-black dark:bg-gray-800 dark:text-white shadow-md`}>
            <div className="ml-3 mt-3 mb-3 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="cursor-pointer" onClick={() => (router.visit("/home"))}>
                        <FontAwesomeIcon icon={faHome} className={`${iconSize}`} />
                    </div>
                    <span className={`ml-1 ${textSize} dark:text-gray-300`}>/ {chapter.name_simple}</span>
                </div>
                {translateMode === 'read' && (
                    <div className="flex w-auto cursor-pointer items-center justify-center p-1 text-center" onClick={handleClick}>
                            <span className={`${buttonSize.padding} ${buttonSize.fontSize} me-5 rounded bg-gray-400   font-bold text-white`}>
                                Kembali
                            </span>
                    </div>
                )}
                <div className="flex cursor-text items-center">
                    <span className="invisible">Placeholder</span>
                </div>
            </div>
        </div>
    );
};

export default InfoHeader;
