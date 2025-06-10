import { Settings } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Combobox from '@/components/ui/combobox';
import { setupTranslations } from '@/features/i18n/i18n';
import { useTheme } from '@/components/layouts/theme-context';
import { Chapter } from '../../types/chapter';
import { Friend } from '../../types/friend';
import { Group } from '../../types/group';
import { Juz } from '../../types/juz';
import { pages } from '../../constanst/pages';
// Define interfaces
interface Option {
  label: string;
  value: string;
}

interface DropdownVisibility {
  group: boolean;
  member: boolean;
  teman: boolean;
  surah: boolean;
  juz: boolean;
  halaman: boolean;
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
  display: string;
  selectedGroup?: string;
  selectedMember?: string;
  selectedFriend?: string;
  selectedSurahValue?: string;
  selectedJuz?: string;
  selectedHalaman?: string;
  reciter?: { user_name: string; full_name: string };
  recipient?: string;
  surah?: Chapter;
}

// Define FormErrors type for validation errors
interface FormErrors {
  penyetor?: string;
  setoran?: string;
  display?: string;
  group?: string;
  member?: string;
  friend?: string;
  surah?: string;
  juz?: string;
  halaman?: string;
}

interface QuraniFormProps {
  friends: Friend[];
  groups: Group[];
  chapters: Chapter[];
  juzs: Juz[];
}

// QuraniCard component
const QuraniCard: React.FC<QuraniFormProps> = ({ friends, groups, chapters, juzs }) => {
  const { t } = useTranslation('form');
  const { isDarkMode } = useTheme();
  const [translationsReady, setTranslationsReady] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({});
  const [penyetor, setPenyetor] = useState<string>('grup');
  const [setoran, setSetoran] = useState<string>('tahsin');
  const [display, setdisplay] = useState<string>('surah');
  const [groupInput, setGroupInput] = useState<string>('');
  const [memberInput, setMemberInput] = useState<string>('');
  const [temanInput, setTemanInput] = useState<string>('');
  const [surahInput, setsurahInput] = useState<string>('');
  const [selectedSurahValue, setSelectedSurahValue] = useState<string>('');
  const [juzInput, setJuzInput] = useState<string>('');
  const [selectedJuz, setSelectedJuz] = useState<string>('');
  const [halamanInput, setHalamanInput] = useState<string>('');
  const [selectedHalaman, setSelectedHalaman] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [currentMembers, setCurrentMembers] = useState<Friend[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [dropdownVisibility, setDropdownVisibility] = useState<DropdownVisibility>({
    group: false,
    member: false,
    teman: false,
    surah: false,
    juz: false,
    halaman: false,
  });

  const groupDropdownRef = useRef<HTMLDivElement>(null);
  const memberDropdownRef = useRef<HTMLDivElement>(null);
  const temanDropdownRef = useRef<HTMLDivElement>(null);
  const surahDropdownRef = useRef<HTMLDivElement>(null);
  const juzDropdownRef = useRef<HTMLDivElement>(null);
  const halamanDropdownRef = useRef<HTMLDivElement>(null);

  const config = {
    PARENT_WEB: import.meta.env.VITE_PARENT_URL,
  };

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      await setupTranslations('form');
      setTranslationsReady(true);
    };
    loadTranslations();
  }, []);

  // Load user data
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedParentData = localStorage.getItem('parent_data');
        if (storedParentData) {
          setUserData(JSON.parse(storedParentData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  // Load saved form data
  useEffect(() => {
    const savedData = localStorage.getItem('last-form-data');
    if (savedData) {
      try {
        const parsedData: SavedSetoranData = JSON.parse(savedData);
        setPenyetor(parsedData.penyetor || 'grup');
        setSetoran(parsedData.setoran || 'tahsin');
        setdisplay(parsedData.display || 'surah');
        setSelectedGroup(parsedData.selectedGroup || '');
        setSelectedSurahValue(parsedData.selectedSurahValue || '');
        setSelectedJuz(parsedData.selectedJuz || '');
        setSelectedHalaman(parsedData.selectedHalaman || '');
        if (parsedData.penyetor === 'grup' && parsedData.selectedMember) {
          setSelectedMember(parsedData.selectedMember);
        }
        if (parsedData.penyetor === 'teman' && parsedData.selectedFriend) {
          setSelectedFriend(parsedData.selectedFriend);
        }
        // Handle backward compatibility for surah
        if (parsedData.surah && Array.isArray(parsedData.surah) && parsedData.surah[0]) {
          parsedData.surah = parsedData.surah[0];
        }
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, []);

  // Update current members when selected group changes
  useEffect(() => {
    const group = groups.find((g) => g.group_id.toString() === selectedGroup);
    setCurrentMembers(group?.users || []);
  }, [selectedGroup, groups]);

  // Save form data to localStorage
  useEffect(() => {
    const saveFormData = () => {
      const formData: SavedSetoranData = {
        penyetor,
        setoran,
        display,
        selectedGroup: penyetor === 'grup' ? selectedGroup : '',
        selectedMember: penyetor === 'grup' ? selectedMember : '',
        selectedFriend: penyetor === 'teman' ? selectedFriend : '',
        selectedSurahValue,
        selectedJuz,
        selectedHalaman,
      };
      localStorage.setItem('last-form-data', JSON.stringify(formData));
    };
    saveFormData();
  }, [
    penyetor,
    setoran,
    display,
    selectedGroup,
    selectedMember,
    selectedFriend,
    selectedSurahValue,
    selectedJuz,
    selectedHalaman,
  ]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const dropdowns = [
        { ref: groupDropdownRef, inputId: 'groupInput', key: 'group' },
        { ref: memberDropdownRef, inputId: 'memberInput', key: 'member' },
        { ref: temanDropdownRef, inputId: 'temanInput', key: 'teman' },
        { ref: surahDropdownRef, inputId: 'surahInput', key: 'surah' },
        { ref: juzDropdownRef, inputId: 'juzInput', key: 'juz' },
        { ref: halamanDropdownRef, inputId: 'halamanInput', key: 'halaman' },
      ];
      dropdowns.forEach(({ ref, inputId, key }) => {
        if (
          ref.current &&
          !ref.current.contains(target) &&
          !document.getElementById(inputId)?.contains(target)
        ) {
          setDropdownVisibility((prev) => ({ ...prev, [key]: false }));
        }
      });
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (penyetor === 'grup') {
      if (!selectedGroup) newErrors.group = t('errors.group_required');
      if (!selectedMember) newErrors.member = t('errors.member_required');
    } else if (penyetor === 'teman') {
      if (!selectedFriend) newErrors.friend = t('errors.friend_required');
    }
    if (!setoran) newErrors.setoran = t('errors.setoran_required');
    if (!display) newErrors.display = t('errors.display_required');
    else {
      if (display === 'surah' && !selectedSurahValue)
        newErrors.surah = t('errors.surah_required');
      else if (display === 'juz' && !selectedJuz)
        newErrors.juz = t('errors.juz_required');
      else if (display === 'halaman' && !selectedHalaman)
        newErrors.halaman = t('errors.halaman_required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get redirect URL
  const getRedirectUrl = (): string => {
    switch (display) {
      case 'surah':
        return selectedSurahValue ? `/surah/${selectedSurahValue}` : '/';
      case 'juz':
        return selectedJuz ? `/juz/${selectedJuz}` : '/';
      case 'halaman':
        return selectedHalaman ? `/page/${selectedHalaman}` : '/';
      default:
        return '/';
    }
  };

  // Handle quick select for surah
  const handleQuickSelect = (value: string): void => {
    setSelectedSurahValue(value);
    setErrors((prev) => ({ ...prev, surah: '' }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!validateForm()) return;

    const currentSetoranData = JSON.parse(localStorage.getItem('setoran-data') ?? '{}');

    let reciter: { user_name: string; full_name: string } | null = null;
    if (penyetor === 'grup') {
      const group = groups.find((g) => g.group_id.toString() === selectedGroup);
      if (group) {
        const member = group.users.find((u) => u.user_name === selectedMember);
        if (member) {
          reciter = { user_name: member.user_name, full_name: member.user_fullname };
        }
      }
    } else if (penyetor === 'teman') {
      const friend = friends.find((f) => f.user_name === selectedFriend);
      if (friend) {
        reciter = { user_name: friend.user_name, full_name: friend.user_fullname };
      }
    }

    const formData: SavedSetoranData = {
      penyetor,
      setoran,
      display,
      reciter: reciter || { user_name: '', full_name: '' },
      recipient: currentSetoranData.recipient || '',
    };

    if (display === 'surah' && selectedSurahValue) {
      const selectedChapter = chapters.find(
        (chapter) => chapter.id.toString() === selectedSurahValue
      );
      if (selectedChapter) {
        formData.surah = {
          id: selectedChapter.id,
          name: selectedChapter.name,
          first_verse: selectedChapter.first_verse,
          last_verse: selectedChapter.last_verse,
        };
      }
    }

    try {
      localStorage.setItem('setoran-data', JSON.stringify(formData));
    } catch (error) {
      console.error('Error saving setoran-data:', error);
    }

    const redirectUrl = getRedirectUrl();
    if (redirectUrl !== '/') {
      window.location.href = redirectUrl;
    } else {
      alert(t('errors.invalid_selection'));
    }
  };

  // Handle form reset
  const handleReset = (): void => {
    setPenyetor('grup');
    setSetoran('tahsin');
    setdisplay('surah');
    setGroupInput('');
    setMemberInput('');
    setTemanInput('');
    setsurahInput('');
    setSelectedSurahValue('');
    setJuzInput('');
    setSelectedJuz('');
    setHalamanInput('');
    setSelectedHalaman('');
    setSelectedGroup('');
    setSelectedMember('');
    setSelectedFriend('');
    setCurrentMembers([]);
    setErrors({});
    localStorage.removeItem('setoran-data');
  };

  if (!translationsReady) return null;

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-2xl">
        <div
          className={`min-h-[520px] overflow-hidden rounded-lg shadow-lg ${
            isDarkMode ? 'bg-[rgb(38,45,52)]' : 'bg-white'
          }`}
        >
          <div className={`px-6 py-3 ${isDarkMode ? 'bg-[rgb(38,45,52)]' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {t('header')}
              </h2>
              <button
                className={`rounded-full p-2 hover:cursor-pointer ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => (window.top.location.href = `${config.PARENT_WEB}/settings/qurani`)}
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-4">
                <label
                  className={`w-24 text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t('labels.reciter')}
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="penyetor"
                      value="grup"
                      checked={penyetor === 'grup'}
                      onChange={(e) => {
                        setPenyetor(e.target.value);
                        setErrors((prev) => ({ ...prev, group: '', member: '', friend: '' }));
                      }}
                      className={`mr-2 ${
                        isDarkMode ? 'text-emerald-400 focus:ring-emerald-600' : 'text-emerald-600 focus:ring-emerald-500'
                      }`}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-neutral-950'}`}>
                      {t('radio_options.group')}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="penyetor"
                      value="teman"
                      checked={penyetor === 'teman'}
                      onChange={(e) => {
                        setPenyetor(e.target.value);
                        setErrors((prev) => ({ ...prev, group: '', member: '', friend: '' }));
                      }}
                      className={`mr-2 ${
                        isDarkMode ? 'text-emerald-400 focus:ring-emerald-600' : 'text-emerald-600 focus:ring-emerald-500'
                      }`}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-neutral-950'}`}>
                      {t('radio_options.friend')}
                    </span>
                  </label>
                </div>
                {errors.penyetor && <p className="text-sm text-red-500">{errors.penyetor}</p>}
              </div>

              {penyetor === 'grup' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <label
                      className={`w-24 text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {t('labels.group')}
                    </label>
                    <div className="relative flex-1">
                      <Combobox
                        options={groups.map((group) => ({
                          label: group.group_title,
                          value: group.group_id.toString(),
                        }))}
                        placeholder={t('placeholders.select_group')}
                        searchPlaceholder={t('placeholders.search_group')}
                        notFoundText={t('not_found.group')}
                        value={selectedGroup}
                        onValueChange={(value) => {
                          setSelectedGroup(value);
                          setSelectedMember('');
                          setErrors((prev) => ({ ...prev, group: '', member: '' }));
                        }}
                        className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-black'}
                      />
                      {errors.group && <p className="mt-1 text-sm text-red-500">{errors.group}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label
                      className={`w-24 text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {t('labels.member')}
                    </label>
                    <div className="relative flex-1">
                      <div
                        className={!selectedGroup ? 'pointer-events-none opacity-50' : ''}
                        title={!selectedGroup ? t('tooltips.select_group_first') : ''}
                      >
                        <Combobox
                          options={currentMembers.map((member) => ({
                            label: member.user_fullname,
                            value: member.user_name,
                          }))}
                          placeholder={
                            !selectedGroup ? t('placeholders.select_group_first') : t('placeholders.select_member')
                          }
                          searchPlaceholder={t('placeholders.search_member')}
                          notFoundText={t('not_found.member')}
                          value={selectedMember}
                          onValueChange={(value) => {
                            setSelectedMember(value);
                            setErrors((prev) => ({ ...prev, member: '' }));
                          }}
                          className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-black'}
                        />
                        {errors.member && (
                          <p className="mt-1 text-sm text-red-500">{errors.member}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {penyetor === 'teman' && (
                <div className="flex items-center space-x-2">
                  <label
                    className={`w-24 text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('labels.friend')}
                  </label>
                  <div className="relative flex-1">
                    <Combobox
                      options={friends.map((friend) => ({
                        label: friend.user_fullname,
                        value: friend.user_name,
                      }))}
                      placeholder={t('placeholders.select_friend')}
                      searchPlaceholder={t('placeholders.search_friend')}
                      notFoundText={t('not_found.friend')}
                      value={selectedFriend}
                      onValueChange={(value) => {
                        setSelectedFriend(value);
                        setErrors((prev) => ({ ...prev, friend: '' }));
                      }}
                      className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-black'}
                    />
                    {errors.friend && <p className="mt-1 text-sm text-red-500">{errors.friend}</p>}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <label
                  className={`w-24 text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t('labels.recite')}
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="setoran"
                      value="tahsin"
                      checked={setoran === 'tahsin'}
                      onChange={(e) => {
                        setSetoran(e.target.value);
                        setErrors((prev) => ({ ...prev, setoran: '' }));
                      }}
                      className={`mr-2 ${
                        isDarkMode ? 'text-emerald-400 focus:ring-emerald-600' : 'text-emerald-600 focus:ring-emerald-500'
                      }`}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-neutral-950'}`}>
                      {t('radio_options.tahsin')}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="setoran"
                      value="tahfidz"
                      checked={setoran === 'tahfidz'}
                      onChange={(e) => {
                        setSetoran(e.target.value);
                        setErrors((prev) => ({ ...prev, setoran: '' }));
                      }}
                      className={`mr-2 ${
                        isDarkMode ? 'text-emerald-400 focus:ring-emerald-600' : 'text-emerald-600 focus:ring-emerald-500'
                      }`}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-neutral-950'}`}>
                      {t('radio_options.tahfidz')}
                    </span>
                  </label>
                </div>
                {errors.setoran && <p className="text-sm text-red-500">{errors.setoran}</p>}
              </div>

              <div className="flex items-center space-x-4">
                <label
                  className={`w-24 text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t('labels.display')}
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="display"
                      value="surah"
                      checked={display === 'surah'}
                      onChange={(e) => {
                        setdisplay(e.target.value);
                        setErrors((prev) => ({ ...prev, display: '', surah: '', juz: '', halaman: '' }));
                      }}
                      className={`mr-2 ${
                        isDarkMode ? 'text-emerald-400 focus:ring-emerald-600' : 'text-emerald-600 focus:ring-emerald-500'
                      }`}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-neutral-950'}`}>
                      {t('radio_options.surah')}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="display"
                      value="juz"
                      checked={display === 'juz'}
                      onChange={(e) => {
                        setdisplay(e.target.value);
                        setErrors((prev) => ({ ...prev, display: '', surah: '', juz: '', halaman: '' }));
                      }}
                      className={`mr-2 ${
                        isDarkMode ? 'text-emerald-400 focus:ring-emerald-600' : 'text-emerald-600 focus:ring-emerald-500'
                      }`}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-neutral-950'}`}>
                      {t('radio_options.juz')}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="display"
                      value="halaman"
                      checked={display === 'halaman'}
                      onChange={(e) => {
                        setdisplay(e.target.value);
                        setErrors((prev) => ({ ...prev, display: '', surah: '', juz: '', halaman: '' }));
                      }}
                      className={`mr-2 ${
                        isDarkMode ? 'text-emerald-400 focus:ring-emerald-600' : 'text-emerald-600 focus:ring-emerald-500'
                      }`}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-neutral-950'}`}>
                      {t('radio_options.page')}
                    </span>
                  </label>
                </div>
                {errors.display && <p className="text-sm text-red-500">{errors.display}</p>}
              </div>

              {display === 'surah' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <label
                      className={`w-24 text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {t('labels.surah')}
                    </label>
                    <div className="relative flex-1">
                      <Combobox
                        options={chapters.map((chapter) => ({
                          label: `${chapter.name} (${chapter.id})`,
                          value: chapter.id.toString(),
                        }))}
                        placeholder={t('placeholders.select_surah')}
                        searchPlaceholder={t('placeholders.search_surah')}
                        notFoundText={t('not_found.surah')}
                        value={selectedSurahValue}
                        onValueChange={(value) => {
                          setSelectedSurahValue(value);
                          setErrors((prev) => ({ ...prev, surah: '' }));
                        }}
                        className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-black'}
                      />
                      {errors.surah && <p className="mt-1 text-sm text-red-500">{errors.surah}</p>}
                    </div>
                  </div>
                  <div className="ml-24 flex flex-wrap gap-2">
                    {[
                      { value: '1', name: t('buttons.quick_select.1') },
                      { value: '36', name: t('buttons.quick_select.36') },
                      { value: '112', name: t('buttons.quick_select.112') },
                      { value: '114', name: t('buttons.quick_select.114') },
                    ].map((button) => (
                      <button
                        key={button.value}
                        type="button"
                        className={`rounded-full px-3 py-1 text-xs hover:cursor-pointer ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                        onClick={() => handleQuickSelect(button.value)}
                      >
                        {button.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {display === 'juz' && (
                <div className="flex items-center space-x-2">
                  <label
                    className={`w-24 text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('labels.juz')}
                  </label>
                  <div className="relative flex-1">
                    <Combobox
                      options={juzs.map((juz) => ({
                        label: juz.id.toString(),
                        value: juz.id.toString(),
                      }))}
                      placeholder={t('placeholders.select_juz')}
                      searchPlaceholder={t('placeholders.search_juz')}
                      notFoundText={t('not_found.juz')}
                      value={selectedJuz}
                      onValueChange={(value) => {
                        setSelectedJuz(value);
                        setErrors((prev) => ({ ...prev, juz: '' }));
                      }}
                      className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-black'}
                    />
                    {errors.juz && <p className="mt-1 text-sm text-red-500">{errors.juz}</p>}
                  </div>
                </div>
              )}

              {display === 'halaman' && (
                <div className="flex items-center space-x-2">
                  <label
                    className={`w-24 text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {t('labels.page')}
                  </label>
                  <div className="relative flex-1">
                    <Combobox
                      options={pages.map((page) => ({
                        label: page.toString(),
                        value: page.toString(),
                      }))}
                      placeholder={t('placeholders.select_page')}
                      searchPlaceholder={t('placeholders.search_page')}
                      notFoundText={t('not_found.page')}
                      value={selectedHalaman}
                      onValueChange={(value) => {
                        setSelectedHalaman(value);
                        setErrors((prev) => ({ ...prev, halaman: '' }));
                      }}
                      className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-black'}
                    />
                    {errors.halaman && (
                      <p className="mt-1 text-sm text-red-500">{errors.halaman}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className={`rounded-md px-4 py-2 text-sm font-medium hover:cursor-pointer ${
                    isDarkMode
                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('buttons.reset')}
                </button>
                <button
                  type="submit"
                  className={`rounded-md px-4 py-2 text-sm font-medium text-white hover:cursor-pointer ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-[rgb(94,114,228)] hover:bg-[rgb(57,69,138)]'
                  }`}
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
