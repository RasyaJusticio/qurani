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

const QuraniCard: React.FC<QuraniFormProps> = ({ friends, groups, chapters, juzs }) => {
  const { t } = useTranslation('form');
  const [translationsReady, setTranslationsReady] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
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
    const loadUserData = () => {
      try {
        const storedParentData = localStorage.getItem('parent_data');
        if (storedParentData) {
          const parsedParentData = JSON.parse(storedParentData);
          setUserData(parsedParentData);
        }
      } catch (error) {
      }
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

  const JUZ_LIST: Option[] = t('juz_list', { returnObjects: true }) as Option[];
  const HALAMAN_LIST: Option[] = t('halaman_list', { returnObjects: true }) as Option[];

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
    }
  };

  const handleQuickSelect = (value: string, name: string): void => {
    setSelectedSurahValue(value);
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
          return `/halaman/${selectedHalaman}`;
        }
        break;
    }
    return '/';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    let reciter: { user_name: string; full_name: string } | null = null;
    if (penyetor === 'grup' && selectedGroup && selectedMember) {
      const member = friends.find((f) => f.user_name === selectedMember);
      if (member) {
        reciter = {
          user_name: member.user_name,
          full_name: member.user_fullname,
        };
      }
    } else if (penyetor === 'teman' && selectedFriend) {
      const friend = friends.find((f) => f.user_name === selectedFriend);
      if (friend) {
        reciter = {
          user_name: friend.user_name,
          full_name: friend.user_fullname,
        };
      }
    }

    const setoranData: any = {
      reciter: reciter || { user_name: '', full_name: '' },
      setoran_type: setoran,
      display: tampilkan,
    };

    if (tampilkan === 'surat' && selectedSurahValue) {
      setoranData.surah_id = selectedSurahValue;
    } else if (tampilkan === 'juz' && selectedJuz) {
      setoranData.juz_id = selectedJuz;
    } else if (tampilkan === 'halaman' && selectedHalaman) {
      setoranData.page_number = selectedHalaman;
    }

    try {
      localStorage.setItem('setoran-data', JSON.stringify(setoranData));
    } catch (error) {
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

  if (!translationsReady) return null;

  return (
    <div className="flex w-full justify-center">
      <div className="w-full">
        <div className="min-h-[520px] overflow-hidden rounded-lg bg-white shadow-lg">
          <div className="bg-white px-6 py-3">
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
                      onChange={(e) => setPenyetor(e.target.value)}
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
                      onChange={(e) => setPenyetor(e.target.value)}
                      className="mr-2 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-neutral-950">{t('radio_options.friend')}</span>
                  </label>
                </div>
              </div>

              {penyetor === 'grup' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <label className="w-24 text-sm font-medium text-gray-700">{t('labels.group')}</label>
                    <div className="relative flex-1">
                      <Combobox
                        options={groups.map((group) => ({ label: group.group_title, value: group.group_id.toString() }))}
                        placeholder="select group"
                        searchPlaceholder="search group"
                        notFoundText="group not found"
                        value={selectedGroup}
                        onValueChange={setSelectedGroup}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="w-24 text-sm font-medium text-gray-700">{t('labels.member')}</label>
                    <div className="relative flex-1">
                      <Combobox
                        options={friends.map((friend) => ({ label: friend.user_fullname, value: friend.user_name }))}
                        placeholder="select member"
                        searchPlaceholder="search member"
                        notFoundText="member not found"
                        value={selectedMember}
                        onValueChange={setSelectedMember}
                      />
                    </div>
                  </div>
                </div>
              )}

              {penyetor === 'teman' && (
                <div className="flex items-center space-x-2">
                  <label className="w-24 text-sm font-medium text-gray-700">{t('labels.friend')}</label>
                  <div className="relative flex-1">
                    <Combobox
                      options={friends.map((friend) => ({ label: friend.user_fullname, value: friend.user_name }))}
                      placeholder="select friend"
                      searchPlaceholder="search friend"
                      notFoundText="friend not found"
                      value={selectedFriend}
                      onValueChange={setSelectedFriend}
                    />
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
                      onChange={(e) => setSetoran(e.target.value)}
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
                      onChange={(e) => setSetoran(e.target.value)}
                      className="mr-2 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-neutral-950">{t('radio_options.tahfidz')}</span>
                  </label>
                </div>
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
                      onChange={(e) => setTampilkan(e.target.value)}
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
                      onChange={(e) => setTampilkan(e.target.value)}
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
                      onChange={(e) => setTampilkan(e.target.value)}
                      className="mr-2 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-neutral-950">{t('radio_options.page')}</span>
                  </label>
                </div>
              </div>

              {tampilkan === 'surat' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <label className="w-24 text-sm font-medium text-gray-700">{t('labels.surah')}</label>
                    <div className="relative flex-1">
                      <Combobox
                        options={chapters.map((chapter) => ({
                          label: chapter.name + ' (' + chapter.id + ')',
                          value: chapter.id.toString(),
                        }))}
                        placeholder="select surah"
                        searchPlaceholder="search surah"
                        notFoundText="surah not found"
                        value={selectedSurahValue}
                        onValueChange={setSelectedSurahValue}
                      />
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
                      options={juzs.map((juz) => ({ label: juz.id.toString(), value: juz.id.toString() }))}
                      placeholder="select juz"
                      searchPlaceholder="search juz"
                      notFoundText="juz not found"
                    />
                  </div>
                </div>
              )}

              {tampilkan === 'halaman' && (
                <div className="flex items-center space-x-2">
                  <label className="w-24 text-sm font-medium text-gray-700">{t('labels.page')}</label>
                  <div className="relative flex-1">
                    <Combobox
                      options={pages.map((page) => ({ label: page.toString(), value: page.toString() }))}
                      placeholder="select page"
                      searchPlaceholder="search page"
                      notFoundText="page not found"
                    />
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
