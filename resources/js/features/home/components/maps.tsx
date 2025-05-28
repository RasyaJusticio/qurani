import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Expand, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapsProps {
  onDashboardClick?: () => void;
}

const Maps = ({ onDashboardClick }: MapsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const cities = [
    { name: 'Jakarta', position: [-6.2088, 106.8456] },
    { name: 'Bandung', position: [-6.9175, 107.6191] },
    { name: 'Surabaya', position: [-7.2575, 112.7521] },
    { name: 'Bali', position: [-8.4095, 115.1889] },
    { name: 'Medan', position: [3.5952, 98.6722] },
  ];

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`mx-auto ${isExpanded ? 'fixed inset-0 z-50 bg-white' : 'max-w-lg'}`}>
      <div className={`overflow-hidden rounded-lg bg-white shadow-lg ${isExpanded ? 'h-[calc(100vh-2rem)]' : ''}`}>
        <div className=" p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Qurani History</h2>
          <div className="flex space-x-2">
            <button
              onClick={toggleExpand}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={isExpanded ? 'Minimize map' : 'Expand map'}
            >
              <Expand className="w-5 h-5" />
            </button>
            {onDashboardClick && (
              <button
                onClick={onDashboardClick}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
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
            {cities.map((city, index) => (
              <Marker key={index} position={city.position}>
                <Popup>
                  <div className="font-medium">{city.name}</div>
                  <div>Lat: {city.position[0].toFixed(4)}</div>
                  <div>Lng: {city.position[1].toFixed(4)}</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="bg-gray-50 p-3 text-sm text-gray-600">
        </div>
      </div>
    </div>
  );
};

export default Maps;
