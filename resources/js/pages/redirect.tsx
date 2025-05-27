import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addTranslations, formatNumberBasedOnLocale  } from '../i18n/i18n';
import Styles from './welcome.module.scss';

const config = {
    PARENT_WEB: import.meta.env.VITE_PARENT_URL,
};

const CompleteComponent = () => {
    const [countdown, setCountdown] = useState(100);
    const [translationsReady, setTranslationsReady] = useState(false);
    const { t, i18n } = useTranslation('redirect');

    useEffect(() => {
        const loadTranslations = async () => {
            await addTranslations('redirect');
            setTranslationsReady(true);
        };
        loadTranslations();
    }, []);

    useEffect(() => {
        if (!translationsReady) return;

        const timer = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown <= 1) {
                    clearInterval(timer);
                    window.location.href = `${config.PARENT_WEB}/qurani`;
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [translationsReady]);

    if (!translationsReady) return null;

    return (
        <div className={Styles.redirectContainer}>
            <div className={Styles.redirectContent}>
                <div className={Styles.container1}>
                    <a href={`${config.PARENT_WEB}/qurani`}>
                        <img src="/assets/svg/1.svg" className={Styles.icon} />
                    </a>
                    <h1
                        className={`${Styles.mainMessage} text-center`}
                        dangerouslySetInnerHTML={{
                            __html: t('home.mainMessage', {
                                parentWeb: config.PARENT_WEB,
                                link: Styles.link,
                            }),
                        }}
                    ></h1>
                </div>
                <p
                    className={Styles.message}
                    dangerouslySetInnerHTML={{
                        __html: t('home.countdownMessage', {
                            countdown: Styles.countdown,
                            count: formatNumberBasedOnLocale (countdown),
                        }),
                    }}
                ></p>
                <div className={Styles.loader}></div>
                <p
                    className={Styles.info}
                    dangerouslySetInnerHTML={{
                        __html: t('home.infoMessage', {
                            qurani: `${config.PARENT_WEB}/qurani`,
                            link: Styles.link,
                        }),
                    }}
                ></p>
            </div>
        </div>
    );
};

export default CompleteComponent;
