import Combobox from '@/components/ui/combobox';
import { setupTranslations } from '@/features/i18n/i18n';
import { Settings } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chapter } from '../../types/chapter';
import { Friend } from '../../types/friend';
import { Group } from '../../types/group';

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
}

const QuraniCard: React.FC<QuraniFormProps> = ({ friends, groups, chapters }) => {
  const { t } = useTranslation('form');
  const [translationsReady, setTranslationsReady] = useState(false);
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

  const handleInputFocus = (type: keyof DropdownVisibility): void => {
    setDropdownVisibility((prev) => ({ ...prev, [type]: true }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
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
    alert('Form submitted! Check console for details.');
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
    setSelectedSurahValue('');
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

  if (!translationsReady) return null;

  return (
    <div className="flex w-full justify-center">
      <div className="w-full">
        <div className="min-h-[520px] overflow-hidden rounded-lg bg-white shadow-lg">
          <div className="bg-white px-6 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-semibold text-black">{t('header')}</h2>
              <button className="rounded-full p-2 hover:cursor-pointer text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => (window.location.href=`${config.PARENT_WEB}/settings/qurani`)}
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
                        className="rounded-full bg-cyan-100 px-3 py-1 text-xs text-cyan-700 hover:bg-cyan-200"
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
                    <input
                      type="text"
                      id="juzInput"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder={t('placeholders.select_juz')}
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

              {tampilkan === 'halaman' && (
                <div className="flex items-center space-x-2">
                  <label className="w-24 text-sm font-medium text-gray-700">{t('labels.page')}</label>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      id="halamanInput"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder={t('placeholders.select_page')}
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

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  {t('buttons.reset')}
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
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
