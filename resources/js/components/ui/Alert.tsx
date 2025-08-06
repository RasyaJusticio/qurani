import { router } from '@inertiajs/react';
import { CircleAlert, CircleCheck, CircleX } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AlertProps {
    show: boolean;
    to: string | null;
    heading?: string;
    message?: string;
    status?: 'success' | 'error' | 'warning';
}

const Alert: React.FC<AlertProps> = ({ show, to, heading, message, status }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (show) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 1000); // hilang setelah 3 detik
            if (!to) {
                return;
            }
            const timerRoute = setTimeout(() => {
                router.visit(to)
            }, 1000)
            return () => {
                clearTimeout(timer)
                clearTimeout(timerRoute)
            };
        }
    }, [show, to]);

    function colorClass() {
        switch (status) {
            case 'success':
                return 'bg-teal-50 border-t-2 border-teal-500 rounded-lg p-4 dark:bg-teal-800';
            case 'warning':
                return "bg-yellow-50 border-t-2 border-yellow-500 rounded-lg p-4 dark:bg-yellow-800";
                break;
            case 'error':
                return "bg-red-50 border-t-2 border-red-500 rounded-lg p-4 dark:bg-red-800";
                break;

            default:
                return "bg-teal-50 border-t-2 border-teal-500 rounded-lg p-4 dark:bg-teal-800"
        }
    }

    function iconClass() {
        switch (status) {
            case 'success':
                return <span className="inline-flex justify-center items-center size-8 rounded-full border-4 border-teal-100 bg-teal-200 text-teal-800 dark:border-teal-900 dark:bg-teal-800 dark:text-teal-400">
                    <CircleCheck />
                </span>;
            case 'warning':
                return <span className="inline-flex justify-center items-center size-8 rounded-full border-4 border-yellow-100 bg-yellow-200 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-800 dark:text-yellow-400">
                    <CircleAlert />
                </span>;
            case 'error':
                return <span className="inline-flex justify-center items-center size-8 rounded-full border-4 border-teal-100 bg-red-200 text-red-800 dark:border-red-900 dark:bg-red-800 dark:text-red-400">
                    <CircleX />
                </span>
            default:
                return <span className="inline-flex justify-center items-center size-8 rounded-full border-4 border-teal-100 bg-teal-200 text-teal-800 dark:border-teal-900 dark:bg-teal-800 dark:text-teal-400">
                    <CircleCheck />
                </span>
        }
    }

    return (
        <div
            className={`min-w-[300px] lg:min-w-[400px] fixed sm:top-20 md:top-[80%] right-5 z-50 transition-all duration-350 ease-out transform ${animate ? 'translate-x-0 opacity-100' : 'translate-x-[500px] opacity-0'
                }`}
        >
            <div
                className={`${colorClass()}`}
                role="alert"
                tabIndex={-1}
                aria-labelledby="hs-bordered-success-style-label"
            >
                <div className="flex">
                    <div className="shrink-0">
                        {iconClass()}
                    </div>
                    <div className="ms-3">
                        <h3 id="hs-bordered-success-style-label" className="text-gray-800 font-semibold dark:text-white">
                            {heading}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-neutral-400">
                            {message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alert
