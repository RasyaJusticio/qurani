import { Settings } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// Interfaces
interface Option {
    value: string;
    name: string;
}

interface DropdownVisibility {
    group: boolean;
    member: boolean;
    teman: boolean;
    surat: boolean;
    juz: boolean;
    halaman: boolean;
}

const SURAH_LIST: Option[] = [
    { value: '1', name: 'Al-Fatihah (1)' },
    { value: '2', name: 'Al-Baqarah (2)' },
    { value: '3', name: "Ali 'Imran (3)" },
    { value: '4', name: 'An-Nisa (4)' },
    { value: '5', name: "Al-Ma'idah (5)" },
    { value: '6', name: "Al-An'am (6)" },
    { value: '7', name: "Al-A'raf (7)" },
    { value: '8', name: 'Al-Anfal (8)' },
    { value: '9', name: 'At-Taubah (9)' },
    { value: '10', name: 'Yunus (10)' },
    { value: '11', name: 'Hud (11)' },
    { value: '12', name: 'Yusuf (12)' },
    { value: '13', name: "Ar-Ra'd (13)" },
    { value: '14', name: 'Ibrahim (14)' },
    { value: '15', name: 'Al-Hijr (15)' },
    { value: '16', name: 'An-Nahl (16)' },
    { value: '17', name: 'Al-Isra (17)' },
    { value: '18', name: 'Al-Kahf (18)' },
    { value: '19', name: 'Maryam (19)' },
    { value: '20', name: 'Ta-Ha (20)' },
    { value: '21', name: 'Al-Anbiya (21)' },
    { value: '22', name: 'Al-Hajj (22)' },
    { value: '23', name: "Al-Mu'minun (23)" },
    { value: '24', name: 'An-Nur (24)' },
    { value: '25', name: 'Al-Furqan (25)' },
    { value: '26', name: "Asy-Syu'ara (26)" },
    { value: '27', name: 'An-Naml (27)' },
    { value: '28', name: 'Al-Qasas (28)' },
    { value: '29', name: 'Al-Ankabut (29)' },
    { value: '30', name: 'Ar-Rum (30)' },
    { value: '31', name: 'Luqman (31)' },
    { value: '32', name: 'As-Sajdah (32)' },
    { value: '33', name: 'Al-Ahzab (33)' },
    { value: '34', name: "Saba' (34)" },
    { value: '35', name: 'Fatir (35)' },
    { value: '36', name: 'Yasin (36)' },
    { value: '37', name: 'As-Saffat (37)' },
    { value: '38', name: 'Sad (38)' },
    { value: '39', name: 'Az-Zumar (39)' },
    { value: '40', name: 'Ghafir (40)' },
    { value: '41', name: 'Fussilat (41)' },
    { value: '42', name: 'Asy-Syura (42)' },
    { value: '43', name: 'Az-Zukhruf (43)' },
    { value: '44', name: 'Ad-Dukhan (44)' },
    { value: '45', name: 'Al-Jasiyah (45)' },
    { value: '46', name: 'Al-Ahqaf (46)' },
    { value: '47', name: 'Muhammad (47)' },
    { value: '48', name: 'Al-Fath (48)' },
    { value: '49', name: 'Al-Hujurat (49)' },
    { value: '50', name: 'Qaf (50)' },
    { value: '51', name: 'Adz-Dzariyat (51)' },
    { value: '52', name: 'At-Tur (52)' },
    { value: '53', name: 'An-Najm (53)' },
    { value: '54', name: 'Al-Qamar (54)' },
    { value: '55', name: 'Ar-Rahman (55)' },
    { value: '56', name: "Al-Waqi'ah (56)" },
    { value: '57', name: 'Al-Hadid (57)' },
    { value: '58', name: 'Al-Mujadilah (58)' },
    { value: '59', name: 'Al-Hasyr (59)' },
    { value: '60', name: 'Al-Mumtahanah (60)' },
    { value: '61', name: 'As-Saff (61)' },
    { value: '62', name: "Al-Jumu'ah (62)" },
    { value: '63', name: 'Al-Munafiqun (63)' },
    { value: '64', name: 'At-Taghabun (64)' },
    { value: '65', name: 'At-Talaq (65)' },
    { value: '66', name: 'At-Tahrim (66)' },
    { value: '67', name: 'Al-Mulk (67)' },
    { value: '68', name: 'Al-Qalam (68)' },
    { value: '69', name: 'Al-Haqqah (69)' },
    { value: '70', name: "Al-Ma'arij (70)" },
    { value: '71', name: 'Nuh (71)' },
    { value: '72', name: 'Al-Jinn (72)' },
    { value: '73', name: 'Al-Muzzammil (73)' },
    { value: '74', name: 'Al-Muddaththir (74)' },
    { value: '75', name: 'Al-Qiyamah (75)' },
    { value: '76', name: 'Al-Insan (76)' },
    { value: '77', name: 'Al-Mursalat (77)' },
    { value: '78', name: "An-Naba' (78)" },
    { value: '79', name: "An-Nazi'at (79)" },
    { value: '80', name: "'Abasa (80)" },
    { value: '81', name: 'At-Takwir (81)' },
    { value: '82', name: 'Al-Infitar (82)' },
    { value: '83', name: 'Al-Mutaffifin (83)' },
    { value: '84', name: 'Al-Insyiqaq (84)' },
    { value: '85', name: 'Al-Buruj (85)' },
    { value: '86', name: 'At-Tariq (86)' },
    { value: '87', name: "Al-A'la (87)" },
    { value: '88', name: 'Al-Ghasyiyah (88)' },
    { value: '89', name: 'Al-Fajr (89)' },
    { value: '90', name: 'Al-Balad (90)' },
    { value: '91', name: 'Asy-Syams (91)' },
    { value: '92', name: 'Al-Lail (92)' },
    { value: '93', name: 'Ad-Duha (93)' },
    { value: '94', name: 'Al-Insyirah (94)' },
    { value: '95', name: 'At-Tin (95)' },
    { value: '96', name: "Al-'Alaq (96)" },
    { value: '97', name: 'Al-Qadr (97)' },
    { value: '98', name: 'Al-Bayyinah (98)' },
    { value: '99', name: 'Az-Zalzalah (99)' },
    { value: '100', name: "Al-'Adiyat (100)" },
    { value: '101', name: "Al-Qari'ah (101)" },
    { value: '102', name: 'At-Takathur (102)' },
    { value: '103', name: "Al-'Asr (103)" },
    { value: '104', name: 'Al-Humazah (104)' },
    { value: '105', name: 'Al-Fil (105)' },
    { value: '106', name: 'Quraisy (106)' },
    { value: '107', name: "Al-Ma'un (107)" },
    { value: '108', name: 'Al-Kautsar (108)' },
    { value: '109', name: 'Al-Kafirun (109)' },
    { value: '110', name: 'An-Nasr (110)' },
    { value: '111', name: 'Al-Lahab (111)' },
    { value: '112', name: 'Al-Ikhlas (112)' },
    { value: '113', name: 'Al-Falaq (113)' },
    { value: '114', name: 'An-Nas (114)' },
];

const JUZ_LIST: Option[] = Array.from({ length: 30 }, (_, i) => ({
    value: `${i + 1}`,
    name: `${i + 1}`,
}));

const HALAMAN_LIST: Option[] = Array.from({ length: 604 }, (_, i) => ({
    value: `${i + 1}`,
    name: `${i + 1}`,
}));

const QuraniCard: React.FC = () => {
    const [penyetor, setPenyetor] = useState<string>('grup');
    const [setoran, setSetoran] = useState<string>('tahsin');
    const [tampilkan, setTampilkan] = useState<string>('surat');
    const [groupInput, setGroupInput] = useState<string>('');
    const [memberInput, setMemberInput] = useState<string>('');
    const [temanInput, setTemanInput] = useState<string>('');
    const [suratInput, setSuratInput] = useState<string>('');
    const [selectedSurat, setSelectedSurat] = useState<string>('');
    const [juzInput, setJuzInput] = useState<string>('');
    const [selectedJuz, setSelectedJuz] = useState<string>('');
    const [halamanInput, setHalamanInput] = useState<string>('');
    const [selectedHalaman, setSelectedHalaman] = useState<string>('');

    const [dropdownVisibility, setDropdownVisibility] = useState<DropdownVisibility>({
        group: false,
        member: false,
        teman: false,
        surat: false,
        juz: false,
        halaman: false,
    });

    const groupDropdownRef = useRef<HTMLDivElement>(null);
    const memberDropdownRef = useRef<HTMLDivElement>(null);
    const temanDropdownRef = useRef<HTMLDivElement>(null);
    const suratDropdownRef = useRef<HTMLDivElement>(null);
    const juzDropdownRef = useRef<HTMLDivElement>(null);
    const halamanDropdownRef = useRef<HTMLDivElement>(null);

    const handleDropdownItemClick = (type: string, value: string, name: string): void => {
        switch (type) {
            case 'surat':
                setSuratInput(name);
                setSelectedSurat(value);
                setDropdownVisibility((prev) => ({ ...prev, surat: false }));
                break;
            case 'juz':
                setJuzInput(name);
                setSelectedJuz(value);
                setDropdownVisibility((prev) => ({ ...prev, juz: false }));
                break;
            case 'halaman':
                setHalamanInput(name);
                setSelectedHalaman(value);
                setDropdownVisibility((prev) => ({ ...prev, halaman: false }));
                break;
            default:
                break;
        }
    };

    const handleQuickSelect = (value: string, name: string): void => {
        setSuratInput(name);
        setSelectedSurat(value);
        setDropdownVisibility((prev) => ({ ...prev, surat: false }));
    };

    const handleInputFocus = (type: keyof DropdownVisibility): void => {
        setDropdownVisibility((prev) => ({ ...prev, [type]: true }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        alert('Form submitted! Check console for details.');
        console.log({
            penyetor,
            setoran,
            tampilkan,
            groupInput,
            memberInput,
            temanInput,
            suratInput,
            selectedSurat,
            juzInput,
            selectedJuz,
            halamanInput,
            selectedHalaman,
        });
    };

    const handleReset = (): void => {
        setPenyetor('grup');
        setSetoran('tahsin');
        setTampilkan('surat');
        setGroupInput('');
        setMemberInput('');
        setTemanInput('');
        setSuratInput('');
        setSelectedSurat('');
        setJuzInput('');
        setSelectedJuz('');
        setHalamanInput('');
        setSelectedHalaman('');
        alert('Form has been reset successfully!');
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent): void => {
            const target = e.target as Node;

            const dropdowns = [
                { ref: groupDropdownRef, inputId: 'groupInput', key: 'group' },
                { ref: memberDropdownRef, inputId: 'memberInput', key: 'member' },
                { ref: temanDropdownRef, inputId: 'temanInput', key: 'teman' },
                { ref: suratDropdownRef, inputId: 'suratInput', key: 'surat' },
                { ref: juzDropdownRef, inputId: 'juzInput', key: 'juz' },
                { ref: halamanDropdownRef, inputId: 'halamanInput', key: 'halaman' },
            ];

            dropdowns.forEach(({ ref, inputId, key }) => {
                if (ref.current && !ref.current.contains(target) && !document.getElementById(inputId)?.contains(target)) {
                    setDropdownVisibility((prev) => ({ ...prev, [key]: false }));
                }
            });
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-md">
                <div className="overflow-hidden rounded-lg bg-white shadow-lg">
                    {/* Header */}
                    <div className="bg-white bg-gradient-to-r px-6 py-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-semibold text-black leading-tight">Qurani</h2>
                            <button className="text-black transition-colors hover:text-cyan-100">
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Reciter Section */}
                            <div className="flex items-center space-x-4">
                                <label className="w-24 text-sm font-medium text-gray-700">Reciter</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="penyetor"
                                            value="grup"
                                            checked={penyetor === 'grup'}
                                            onChange={(e) => setPenyetor(e.target.value)}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">Group</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="penyetor"
                                            value="teman"
                                            checked={penyetor === 'teman'}
                                            onChange={(e) => setPenyetor(e.target.value)}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">Friend</span>
                                    </label>
                                </div>
                            </div>

                            {/* Group Section */}
                            {penyetor === 'grup' && (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <label className="w-24 text-sm font-medium text-gray-700">Group</label>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                id="groupInput"
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                                placeholder="Select Group"
                                                value={groupInput}
                                                onChange={(e) => setGroupInput(e.target.value)}
                                                onFocus={() => handleInputFocus('group')}
                                                autoComplete="off"
                                            />
                                            {dropdownVisibility.group && (
                                                <div
                                                    ref={groupDropdownRef}
                                                    className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
                                                >
                                                    <div className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-50">Join a group first</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <label className="w-24 text-sm font-medium text-gray-700">Member</label>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                id="memberInput"
                                                className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                                                placeholder="Select a group first"
                                                value={memberInput}
                                                onChange={(e) => setMemberInput(e.target.value)}
                                                onFocus={() => handleInputFocus('member')}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Friend Section */}
                            {penyetor === 'teman' && (
                                <div className="flex items-center space-x-2">
                                    <label className="w-24 text-sm font-medium text-gray-700">Friend</label>
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            id="temanInput"
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            placeholder="Select Friend"
                                            value={temanInput}
                                            onChange={(e) => setTemanInput(e.target.value)}
                                            onFocus={() => handleInputFocus('teman')}
                                            autoComplete="off"
                                        />
                                        {dropdownVisibility.teman && (
                                            <div
                                                ref={temanDropdownRef}
                                                className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
                                            >
                                                <div className="px-3 py-2 text-sm text-gray-900 hover:bg-gray-50">No friends available</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Recite Section */}
                            <div className="flex items-center space-x-4">
                                <label className="w-24 text-sm font-medium text-gray-700">Recite</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="setoran"
                                            value="tahsin"
                                            checked={setoran === 'tahsin'}
                                            onChange={(e) => setSetoran(e.target.value)}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">Tahsin</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="setoran"
                                            value="tahfidz"
                                            checked={setoran === 'tahfidz'}
                                            onChange={(e) => setSetoran(e.target.value)}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">Tahfidz</span>
                                    </label>
                                </div>
                            </div>

                            {/* Display Section */}
                            <div className="flex items-center space-x-4">
                                <label className="w-24 text-sm font-medium text-gray-700">Display</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="tampilkan"
                                            value="surat"
                                            checked={tampilkan === 'surat'}
                                            onChange={(e) => setTampilkan(e.target.value)}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">Surah</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="tampilkan"
                                            value="juz"
                                            checked={tampilkan === 'juz'}
                                            onChange={(e) => setTampilkan(e.target.value)}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">Juz</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="tampilkan"
                                            value="halaman"
                                            checked={tampilkan === 'halaman'}
                                            onChange={(e) => setTampilkan(e.target.value)}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">Page</span>
                                    </label>
                                </div>
                            </div>

                            {/* Surah Section */}
                            {tampilkan === 'surat' && (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <label className="w-24 text-sm font-medium text-gray-700">Surah</label>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                id="suratInput"
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                                placeholder="Select Surah"
                                                value={suratInput}
                                                onChange={(e) => setSuratInput(e.target.value)}
                                                onFocus={() => handleInputFocus('surat')}
                                            />
                                            {dropdownVisibility.surat && (
                                                <div
                                                    ref={suratDropdownRef}
                                                    className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
                                                >
                                                    {SURAH_LIST.filter((surah) => surah.name.toLowerCase().includes(suratInput.toLowerCase())).map(
                                                        (surah) => (
                                                            <div
                                                                key={surah.value}
                                                                className="cursor-pointer px-3 py-2 text-sm text-gray-900 hover:bg-emerald-50 hover:text-emerald-700"
                                                                onClick={() => handleDropdownItemClick('surat', surah.value, surah.name)}
                                                            >
                                                                {surah.name}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Select Buttons */}
                                    <div className="ml-25 flex flex-wrap gap-2">
                                        {[
                                            { value: '1', name: 'Al-Fatihah (1)', displayText: 'Al-Fatihah' },
                                            { value: '36', name: 'Yasin (36)', displayText: 'Yasin' },
                                            { value: '112', name: 'Al-Ikhlas (112)', displayText: 'Al-Ikhlas' },
                                            { value: '114', name: 'An-Nas (114)', displayText: 'An-Nas' },
                                        ].map((button) => (
                                            <button
                                                key={button.value}
                                                type="button"
                                                className="rounded-full bg-cyan-100 px-3 py-1 text-xs text-cyan-700 transition-colors hover:bg-cyan-200"
                                                onClick={() => handleQuickSelect(button.value, button.name)}
                                            >
                                                {button.displayText}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Juz Section */}
                            {tampilkan === 'juz' && (
                                <div className="flex items-center space-x-2">
                                    <label className="w-24 text-sm font-medium text-gray-700">Juz</label>
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            id="juzInput"
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            placeholder="Select Juz"
                                            value={juzInput}
                                            onChange={(e) => setJuzInput(e.target.value)}
                                            onFocus={() => handleInputFocus('juz')}
                                        />
                                        {dropdownVisibility.juz && (
                                            <div
                                                ref={juzDropdownRef}
                                                className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
                                            >
                                                {JUZ_LIST.filter((juz) => juz.name.includes(juzInput)).map((juz) => (
                                                    <div
                                                        key={juz.value}
                                                        className="cursor-pointer px-3 py-2 text-sm text-gray-900 hover:bg-emerald-50 hover:text-emerald-700"
                                                        onClick={() => handleDropdownItemClick('juz', juz.value, juz.name)}
                                                    >
                                                        {juz.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Halaman Section */}
                            {tampilkan === 'halaman' && (
                                <div className="flex items-center space-x-2">
                                    <label className="w-24 text-sm font-medium text-gray-700">Page</label>
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            id="halamanInput"
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            placeholder="Select Page"
                                            value={halamanInput}
                                            onChange={(e) => setHalamanInput(e.target.value)}
                                            onFocus={() => handleInputFocus('halaman')}
                                        />
                                        {dropdownVisibility.halaman && (
                                            <div
                                                ref={halamanDropdownRef}
                                                className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
                                            >
                                                {HALAMAN_LIST.filter((page) => page.name.includes(halamanInput)).map((page) => (
                                                    <div
                                                        key={page.value}
                                                        className="cursor-pointer px-3 py-2 text-sm text-gray-900 hover:bg-emerald-50 hover:text-emerald-700"
                                                        onClick={() => handleDropdownItemClick('halaman', page.value, page.name)}
                                                    >
                                                        {page.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Form Buttons */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-200"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-cyan-700"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuraniCard;
