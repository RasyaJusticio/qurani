import Combobox from '@/components/ui/combobox';
import { setupTranslations } from '@/features/i18n/i18n';
import { Settings } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chapter } from '../../types/chapter';
import { Friend } from '../../types/friend';
import { Group } from '../../types/group';
import { Juz } from '../../types/juz';
import { pages } from '../../constanst/pages';
import { useTheme } from '../../../../components/layouts/theme-context';

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

interface QuraniFormProps {
    friends: Friend[];
    groups: Group[];
    chapters: Chapter[];
    juzs: Juz[];
}

interface UserData {
    c_user?: string;
    s_lang?: string;
    s_night_mode?: string;
    user_session?: string;
    signature?: string;
}

interface SavedSetoranData {
    penyetor: string;
    setoran: string;
    tampilkan: string;
    selectedGroup?: string;
    selectedMember?: string;
    selectedFriend?: string;
    selectedSurahValue?: string;
    selectedJuz?: string;
    selectedHalaman?: string;
    reciter?: { user_name: string; full_name: string };
}

const QuraniCard: React.FC<QuraniFormProps> = ({ friends, groups, chapters, juzs }) => {
    const { t } = useTranslation('form');
    const [translationsReady, setTranslationsReady] = useState(false);
    const [userData, setUserData] = useState<UserData>({});
    const { isDarkMode } = useTheme();
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
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [selectedFriend, setSelectedFriend] = useState<string>('');
    const [selectedSurahValue, setSelectedSurahValue] = useState<string>('');
    const [currentMembers, setCurrentMembers] = useState<Friend[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const config = {
        PARENT_WEB: import.meta.env.VITE_PARENT_URL,
    };

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

    useEffect(() => {
        const savedData = localStorage.getItem('setoran-data');
        if (savedData) {
            try {
                const parsedData: SavedSetoranData = JSON.parse(savedData);

                setPenyetor(parsedData.penyetor || 'grup');
                setSetoran(parsedData.setoran || 'tahsin');
                setTampilkan(parsedData.tampilkan || 'surat');
                setSelectedGroup(parsedData.selectedGroup || '');
                setSelectedSurahValue(parsedData.selectedSurahValue || '');
                setSelectedJuz(parsedData.selectedJuz || '');
                setSelectedHalaman(parsedData.selectedHalaman || '');
                // Only set member or friend if they match the penyetor type
                if (parsedData.penyetor === 'grup' && parsedData.selectedMember) {
                    setSelectedMember(parsedData.selectedMember);
                }
                if (parsedData.penyetor === 'teman' && parsedData.selectedFriend) {
                    setSelectedFriend(parsedData.selectedFriend);
                }
            } catch (error) {
                console.error('Error parsing saved data:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            const group = groups.find(g => g.group_id.toString() === selectedGroup);
            if (group && group.users) {
                setCurrentMembers(group.users);
            } else {
                setCurrentMembers([]);
            }
        } else {
            setCurrentMembers([]);
        }
    }, [selectedGroup, groups]);

    useEffect(() => {
        const saveFormData = () => {
            const formData: SavedSetoranData = {
                penyetor,
                setoran,
                tampilkan,
                selectedGroup: penyetor === 'grup' ? selectedGroup : '',
                selectedMember: penyetor === 'grup' ? selectedMember : '',
                selectedFriend: penyetor === 'teman' ? selectedFriend : '',
                selectedSurahValue,
                selectedJuz,
                selectedHalaman,
            };
            localStorage.setItem('setoran-data', JSON.stringify(formData));
        };

        saveFormData();
    }, [penyetor, setoran, tampilkan, selectedGroup, selectedMember, selectedFriend, selectedSurahValue, selectedJuz, selectedHalaman]);

    useEffect(() => {
        const loadUserData = () => {
            try {
                const storedParentData = localStorage.getItem('parent_data');
                if (storedParentData) {
                    const parsedParentData = JSON.parse(storedParentData);
                    setUserData(parsedParentData);
                }
            } catch (error) {}
        };

        loadUserData();
    }, []);

    useEffect(() => {
        const loadTranslations = async () => {
            await setupTranslations('form');
            setTranslationsReady(true);
        };
        loadTranslations();
    }, []);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (penyetor === 'grup') {
            if (!selectedGroup) {
                newErrors.group = t('newErrors.Group_must_be_selected');
            }
            if (!selectedMember) {
                newErrors.member = t('newErrors.Member_must_be_selected');
            }
        } else if (penyetor === 'teman') {
            if (!selectedFriend) {
                newErrors.friend = t('newErrors.Friend_must_be_selected');
            }
        }

        if (!setoran) {
            newErrors.setoran = t('newErrors.Type_of_deposit_must_be_selected');
        }

        if (!tampilkan) {
            newErrors.tampilkan = t('newErrors.Display_must_be_selected');
        } else {
            if (tampilkan === 'surat' && !selectedSurahValue) {
                newErrors.surat = t('newErrors.Surah_must_be_selected');
            } else if (tampilkan === 'juz' && !selectedJuz) {
                newErrors.juz = t('newErrors.Juz_must_be_selected');
            } else if (tampilkan === 'halaman' && !selectedHalaman) {
                newErrors.halaman = t('newErrors.Page_must_be_selected');
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleQuickSelect = (value: string, name: string): void => {
        setSelectedSurahValue(value);
        setErrors(prev => ({ ...prev, surat: '' }));
    };

    const getRedirectUrl = (): string => {
        switch (tampilkan) {
            case 'surat':
                if (selectedSurahValue) {
                    return `/surah/${selectedSurahValue}`;
                }
                break;
            case 'juz':
                if (selectedJuz) {
                    return `/juz/${selectedJuz}`;
                }
                break;
            case 'halaman':
                if (selectedHalaman) {
                    return `/page/${selectedHalaman}`;
                }
                break;
        }
        return '/';
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        let reciter: { user_name: string; full_name: string } | null = null;
        if (penyetor === 'grup') {
            const group = groups.find(g => g.group_id.toString() === selectedGroup);
            if (group) {
                const member = group.users.find(u => u.user_name === selectedMember);
                if (member) {
                    reciter = {
                        user_name: member.user_name,
                        full_name: member.user_fullname,
                    };
                }
            }
        } else if (penyetor === 'teman') {
            const friend = friends.find(f => f.user_name === selectedFriend);
            if (friend) {
                reciter = {
                    user_name: friend.user_name,
                    full_name: friend.user_fullname,
                };
            }
        }

        const formData: SavedSetoranData = {
            penyetor,
            setoran,
            tampilkan,
            selectedGroup: penyetor === 'grup' ? selectedGroup : '',
            selectedMember: penyetor === 'grup' ? selectedMember : '',
            selectedFriend: penyetor === 'teman' ? selectedFriend : '',
            selectedSurahValue: tampilkan === 'surat' ? selectedSurahValue : '',
            selectedJuz: tampilkan === 'juz' ? selectedJuz : '',
            selectedHalaman: tampilkan === 'halaman' ? selectedHalaman : '',
            reciter: reciter || { user_name: '', full_name: '' },
        };

        try {
            localStorage.setItem('setoran-data', JSON.stringify(formData));
        } catch (error) {
            console.error('Error saving setoran-data:', error);
        }

        const redirectUrl = getRedirectUrl();
        if (redirectUrl !== '/') {
            window.location.href = redirectUrl;
        } else {
            alert('Please select a valid option to proceed');
        }
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
        setSelectedGroup('');
        setSelectedMember('');
        setSelectedFriend('');
        setSelectedSurahValue('');
        setJuzInput('');
        setSelectedJuz('');
        setHalamanInput('');
        setSelectedHalaman('');
        setCurrentMembers([]);
        setErrors({});
        localStorage.removeItem('setoran-data');
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
                    setDropdownVisibility(prev => ({ ...prev, [key]: false }));
                }
            });
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    if (!translationsReady) return null;

    return (
        <div className={`flex w-full justify-center`}>
            <div className="w-full max-w-2xl">
                <div className={`min-h-[520px] overflow-hidden rounded-lg shadow-lg ${isDarkMode ? 'bg-[rgb(38,45,52)]' : 'bg-white'}`}>
                    <div className={`px-6 py-3 ${isDarkMode ? 'bg-[rgb(38,45,52)]' : 'bg-white'}`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-semibold text-black">{t('header')}</h2>
                            <button
                                className="rounded-full p-2 hover:cursor-pointer text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                onClick={() => (window.top.location.href = `${config.PARENT_WEB}/settings/qurani`)}
                            >
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <label className="w-24 text-sm font-medium text-gray-700">{t('labels.reciter')}</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="penyetor"
                                            value="grup"
                                            checked={penyetor === 'grup'}
                                            onChange={e => {
                                                setPenyetor(e.target.value);
                                                setErrors(prev => ({ ...prev, group: '', member: '', friend: '' }));
                                            }}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">{t('radio_options.group')}</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="penyetor"
                                            value="teman"
                                            checked={penyetor === 'teman'}
                                            onChange={e => {
                                                setPenyetor(e.target.value);
                                                setErrors(prev => ({ ...prev, group: '', member: '', friend: '' }));
                                            }}
                                            className={`mr-2 ${isDarkMode ? 'text-emerald-400 focus:ring-emerald-600' : 'text-emerald-600 focus:ring-emerald-500'}`}
                                        />
                                        <span className="text-sm text-neutral-950">{t('radio_options.friend')}</span>
                                    </label>
                                </div>
                                {errors.penyetor && <p className="text-sm text-red-500">{errors.penyetor}</p>}
                            </div>

                            {penyetor === 'grup' && (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <label className="w-24 text-sm font-medium text-gray-700">{t('labels.group')}</label>
                                        <div className="relative flex-1">
                                            <Combobox
                                                options={groups.map(group => ({
                                                    label: group.group_title,
                                                    value: group.group_id.toString()
                                                }))}
                                                placeholder={t('placeholders.select_group')}
                                                searchPlaceholder={t('placeholders.search_group')}
                                                notFoundText={t('notFoundText.group_not_found')}
                                                value={selectedGroup}
                                                onValueChange={(value) => {
                                                    setSelectedGroup(value);
                                                    setSelectedMember('');
                                                    setErrors(prev => ({ ...prev, group: '' }));
                                                }}
                                            />
                                            {errors.group && <p className="mt-1 text-sm text-red-500">{errors.group}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <label className="w-24 text-sm font-medium text-gray-700">{t('labels.member')}</label>
                                        <div className="relative flex-1">
                                            <div
                                                className={`${!selectedGroup ? 'pointer-events-none opacity-50' : ''}`}
                                                title={!selectedGroup ? 'Please select a group first' : ''}
                                            >
                                                <Combobox
                                                    options={currentMembers.map(member => ({
                                                        label: member.user_fullname,
                                                        value: member.user_name,
                                                    }))}
                                                    placeholder={
                                                    !selectedGroup
                                                        ? t('placeholders.select_group_first')
                                                        : t('placeholders.select_member')
                                                    }
                                                    searchPlaceholder={
                                                    !selectedGroup
                                                        ? ''
                                                        : t('placeholders.search_member')
                                                    }

                                                    notFoundText={t('notFoundText.member_not_found')}
                                                    value={selectedMember}
                                                    onValueChange={(value) => {
                                                        setSelectedMember(value);
                                                        setErrors(prev => ({ ...prev, member: '' }));
                                                    }}
                                                />
                                                {errors.member && <p className="mt-1 text-sm text-red-500">{errors.member}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {penyetor === 'teman' && (
                                <div className="flex items-center space-x-2">
                                    <label className="w-24 text-sm font-medium text-gray-700">{t('labels.friend')}</label>
                                    <div className="relative flex-1">
                                        <Combobox
                                            options={friends.map(friend => ({ label: friend.user_fullname, value: friend.user_name }))}
                                            placeholder={t('placeholders.select_friend')}
                                            searchPlaceholder={t('placeholders.search_friend')}
                                            notFoundText={t('notFoundText.friend_not_found')}
                                            value={selectedFriend}
                                            onValueChange={(value) => {
                                                setSelectedFriend(value);
                                                setErrors(prev => ({ ...prev, friend: '' }));
                                            }}
                                        />
                                        {errors.friend && <p className="mt-1 text-sm text-red-500">{errors.friend}</p>}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-4">
                                <label className="w-24 text-sm font-medium text-gray-700">{t('labels.recite')}</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="setoran"
                                            value="tahsin"
                                            checked={setoran === 'tahsin'}
                                            onChange={e => {
                                                setSetoran(e.target.value);
                                                setErrors(prev => ({ ...prev, setoran: '' }));
                                            }}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">{t('radio_options.tahsin')}</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="setoran"
                                            value="tahfidz"
                                            checked={setoran === 'tahfidz'}
                                            onChange={e => {
                                                setSetoran(e.target.value);
                                                setErrors(prev => ({ ...prev, setoran: '' }));
                                            }}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">{t('radio_options.tahfidz')}</span>
                                    </label>
                                </div>
                                {errors.setoran && <p className="text-sm text-red-500">{errors.setoran}</p>}
                            </div>

                            <div className="flex items-center space-x-4">
                                <label className="w-24 text-sm font-medium text-gray-700">{t('labels.display')}</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="tampilkan"
                                            value="surat"
                                            checked={tampilkan === 'surat'}
                                            onChange={e => {
                                                setTampilkan(e.target.value);
                                                setErrors(prev => ({ ...prev, tampilkan: '', surat: '', juz: '', halaman: '' }));
                                            }}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">{t('radio_options.surah')}</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="tampilkan"
                                            value="juz"
                                            checked={tampilkan === 'juz'}
                                            onChange={e => {
                                                setTampilkan(e.target.value);
                                                setErrors(prev => ({ ...prev, tampilkan: '', surat: '', juz: '', halaman: '' }));
                                            }}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">{t('radio_options.juz')}</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="tampilkan"
                                            value="halaman"
                                            checked={tampilkan === 'halaman'}
                                            onChange={e => {
                                                setTampilkan(e.target.value);
                                                setErrors(prev => ({ ...prev, tampilkan: '', surat: '', juz: '', halaman: '' }));
                                            }}
                                            className="mr-2 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-neutral-950">{t('radio_options.page')}</span>
                                    </label>
                                </div>
                                {errors.tampilkan && <p className="text-sm text-red-500">{errors.tampilkan}</p>}
                            </div>

                            {tampilkan === 'surat' && (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <label className="w-24 text-sm font-medium text-gray-700">{t('labels.surah')}</label>
                                        <div className="relative flex-1">
                                            <Combobox
                                                options={chapters.map(chapter => ({
                                                    label: chapter.name + ' (' + chapter.id + ')',
                                                    value: chapter.id.toString(),
                                                }))}
                                                placeholder={t('placeholders.select_surah')}
                                                searchPlaceholder={t('placeholders.search_surah')}
                                                notFoundText={t('notFoundText.surah_not_found')}
                                                value={selectedSurahValue}
                                                onValueChange={(value) => {
                                                    setSelectedSurahValue(value);
                                                    setErrors(prev => ({ ...prev, surat: '' }));
                                                }}
                                            />
                                            {errors.surat && <p className="mt-1 text-sm text-red-500">{errors.surat}</p>}
                                        </div>
                                    </div>
                                    <div className="ml-24 flex flex-wrap gap-2">
                                        {[
                                            { value: '1', name: 'Al-Fatihah' },
                                            { value: '36', name: 'Yasin' },
                                            { value: '112', name: 'Al-Ikhlas' },
                                            { value: '114', name: 'An-Nas' },
                                        ].map(button => (
                                            <button
                                                key={button.value}
                                                type="button"
                                                className="rounded-full bg-gray-300 px-3 py-1 text-xs text-black hover:bg-gray-400 hover:cursor-pointer"
                                                onClick={() => handleQuickSelect(button.value, button.name)}
                                            >
                                                {button.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {tampilkan === 'juz' && (
                                <div className="flex items-center space-x-2">
                                    <label className="w-24 text-sm font-medium text-gray-700">{t('labels.juz')}</label>
                                    <div className="relative flex-1">
                                        <Combobox
                                            options={juzs.map(juz => ({ label: juz.id.toString(), value: juz.id.toString() }))}
                                            placeholder={t('placeholders.select_juz')}
                                            searchPlaceholder={t('placeholders.search_juz')}
                                            notFoundText={t('notFoundText.juz_not_found')}
                                            value={selectedJuz}
                                            onValueChange={(value) => {
                                                setSelectedJuz(value);
                                                setErrors(prev => ({ ...prev, juz: '' }));
                                            }}
                                        />
                                        {errors.juz && <p className="mt-1 text-sm text-red-500">{errors.juz}</p>}
                                    </div>
                                </div>
                            )}

                            {tampilkan === 'halaman' && (
                                <div className="flex items-center space-x-2">
                                    <label className="w-24 text-sm font-medium text-gray-700">{t('labels.page')}</label>
                                    <div className="relative flex-1">
                                        <Combobox
                                            options={pages.map(page => ({ label: page.toString(), value: page.toString() }))}
                                            placeholder={t('placeholders.select_page')}
                                            searchPlaceholder={t('placeholders.search_page')}
                                            notFoundText={t('notFoundText.page_not_found')}
                                            value={selectedHalaman}
                                            onValueChange={(value) => {
                                                setSelectedHalaman(value);
                                                setErrors(prev => ({ ...prev, halaman: '' }));
                                            }}
                                        />
                                        {errors.halaman && <p className="mt-1 text-sm text-red-500">{errors.halaman}</p>}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:cursor-pointer"
                                >
                                    {t('buttons.reset')}
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-[rgb(94,114,228)] px-4 py-2 text-sm font-medium text-white hover:bg-[rgb(57,69,138)] hover:cursor-pointer"
                                >
                                    {t('buttons.submit')}
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
