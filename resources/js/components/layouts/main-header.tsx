import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Inertia } from '@inertiajs/inertia';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

interface QuranHeaderProps {
  page: number;
  translateMode?: string;
  classNav?: string;
  finishButtonPath?: string;
  isJuz?: boolean;
}

const QuranHeader: React.FC<QuranHeaderProps> = ({
  page,
  translateMode = 'read',
  classNav = '',
  finishButtonPath = '/Rekapan-surah',
  isJuz = false,
}) => {
  const { t } = useTranslation();
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>('md');

  const config = {
    PARENT_WEB: import.meta.env.VITE_PARENT_URL,
  };

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
    const targetPath = isJuz ? '/rekapan-juz' : finishButtonPath;
    Inertia.visit(`${targetPath}?page=${page}`);
  };

  const urlNow = window.location.href;
  const lastSegment = urlNow.split('/').pop();
  console.log(lastSegment);

  const noFinishButton = (()=>{
    return (['dashboard'].includes(lastSegment as string));
  })

  return (
    <div className={`px-6 ${classNav} fixed w-full bg-neutral-100 z-50`}>
      <div className="flex justify-between items-center mt-3 mb-3">
        <div className="flex items-center">
          <div
            className="cursor-pointer"
            onClick={() => (window.location.href = `/`)}
          >
            <FontAwesomeIcon icon={faHome} className={`${iconSize} text-[#2CA4AB]`} />
          </div>
          <span className={`ml-1 ${textSize}`}>
            / {lastSegment}
          </span>
        </div>
        {translateMode === 'read' && (
          <div
            className="flex justify-center items-center cursor-pointer text-center p-1 w-auto"
            onClick={handleClick}
          >
            { !noFinishButton() && <span
              className={`${buttonSize.padding} ${buttonSize.fontSize} text-white font-bold rounded me-5 bg-[#ff6500]`}
            >
              Selesai
            </span>}
          </div>
        )}
        <div className="cursor-text flex items-center">
          <span className="invisible">Placeholder</span>
        </div>
      </div>
    </div>
  );
};

export default QuranHeader;
