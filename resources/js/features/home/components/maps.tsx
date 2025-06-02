import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Expand, Grid2X2 } from 'lucide-react';
import { useState, useEffect } from 'react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
});

const translations = {
  en: {
    title: 'Qurani History',
  },
  id: {
    title: 'Riwayat Qurani',
  },
  ar: {
    title: 'تاريخ قرآني',
  },
};

const Maps = ({ }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lang, setLang] = useState<'en' | 'id' | 'ar'>('en');

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

 useEffect(() => {
  const locale = localStorage.getItem('language_code');
  const validLang = {
    id_id: 'id',
    ra_ra: 'ar',
    en_us: 'en',
  }[locale] || 'id';
  setLang(validLang);
}, []);

  return (
    <div className={`mx-auto w-full h-full ${isExpanded ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className={`overflow-hidden rounded-lg bg-white shadow-lg h-full w-full`}>
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {translations[lang].title}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => (window.location.href='/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors hover:cursor-pointer"
              aria-label="Go to dashboard"
            >
              <Grid2X2 className="w-5 h-5" />
            </button>
            <button
              onClick={toggleExpand}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors hover:cursor-pointer"
              aria-label={isExpanded ? 'Minimize map' : 'Expand map'}
            >
              <Expand className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className={`w-full px-5 ${isExpanded ? 'h-[calc(100vh-7rem)]' : 'h-107'}`}>
          <MapContainer
            center={[-2.5, 118]}
            zoom={4}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </MapContainer>
        </div>

        <div className="bg-gray-50 p-3 text-sm text-gray-600">
        </div>
      </div>
    </div>
  );
};

export default Maps;
