import React, { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
}

interface SlidingToggleSelectProps {
    options: Option[];
    selectedValue: string;
    onSelect: (value: string) => void;
    className?: string;
}

const SlidingToggleSelect: React.FC<SlidingToggleSelectProps> = ({
    options,
    selectedValue,
    onSelect,
    className = '',
}) => {
    const [sliderStyle, setSliderStyle] = useState({});
    const containerRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (containerRef.current && optionRefs.current.length > 0) {
            const selectedIndex = options.findIndex(option => option.value === selectedValue);
            if (selectedIndex !== -1 && optionRefs.current[selectedIndex]) {
                const selectedOptionElement = optionRefs.current[selectedIndex];
                const containerWidth = containerRef.current.offsetWidth;
                const optionWidth = selectedOptionElement!.offsetWidth;
                const optionOffsetLeft = selectedOptionElement!.offsetLeft - 4;
                // Hitung posisi dan lebar slider
                setSliderStyle({
                    width: `${optionWidth}px`,
                    transform: `translateX(${optionOffsetLeft}px)`,
                });
            }
        }
    }, [selectedValue, options]); // Re-run effect when selectedValue or options change

    return (
        <div
            ref={containerRef}
            className={`relative flex justify-between cursor-pointer rounded-full bg-gray-200 p-1 dark:bg-gray-700 ${className}`}
        >
            {/* Slider / Indikator yang Bergerak */}
            <div
                className="absolute top-1 bottom-1 rounded-full bg-blue-500 shadow transition-transform duration-300 ease-in-out"
                style={sliderStyle}
            ></div>

            {/* Opsi-opsi */}
            {options.map((option, index) => (
                <div
                    key={option.value}
                    ref={el => (optionRefs.current[index] = el)}
                    className={`relative z-10 flex-1 px-1 py-2 text-center text-sm font-medium transition-colors duration-200
                        ${selectedValue === option.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'}
                    `}
                    onClick={() => onSelect(option.value)}
                >
                    {option.label}
                </div>
            ))}
        </div>
    );
};

export default SlidingToggleSelect;
