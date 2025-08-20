import { Periode, SetoranRekap, SetoranRekapTotal } from '@/features/home/types/setoranRekap';
import { useForm } from '@inertiajs/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Calendar, Expand, Grid2X2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useTheme } from '../../../components/layouts/theme-context';
import { useTranslation } from 'react-i18next';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
// delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconUrl: "/assets/img/marker-icon.png",
    iconRetinaUrl: "/assets/img/marker-icon.png", // wajib ditambah biar retina nggak fallback ke default
    shadowUrl: "/assets/img/marker-shadow.png",
});




const INDONESIA_BOUNDS = L.latLngBounds(L.latLng(-11, 94), L.latLng(6, 141));

const MapBounds = () => {
    const map = useMap();
    useEffect(() => {
        if (!map) return undefined;
        map.setMaxBounds(INDONESIA_BOUNDS);
        const handleDrag = () => {
            if (!INDONESIA_BOUNDS.contains(map.getCenter())) {
                map.panInsideBounds(INDONESIA_BOUNDS, { animate: true });
            }
        };
        const handleMoveEnd = () => map.invalidateSize();

        map.on('drag', handleDrag);
        map.on('moveend', handleMoveEnd);

        return () => {
            map.off('drag', handleDrag);
            map.off('moveend', handleMoveEnd);
        };
    }, [map]);
    return null;
};

const MinimizeControl = ({ isExpanded, toggleExpand, isDarkMode }: { isExpanded: boolean; toggleExpand: () => void; isDarkMode: boolean }) => {
    const map = useMap();
    useEffect(() => {
        if (!isExpanded) return;
        const CustomControl = L.Control.extend({
            options: { position: 'topright' },
            onAdd: () => {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
                container.style.backgroundColor = 'dark:rgb(38,45,52) white';
                container.style.width = '34px';
                container.style.height = '34px';
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.justifyContent = 'center';
                container.style.cursor = 'pointer';
                container.style.borderRadius = '4px';
                container.style.border = 'none';
                container.title = 'Minimize map';
                container.innerHTML =
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
                container.onclick = () => {
                    toggleExpand();
                    setTimeout(() => map.invalidateSize(), 100);
                };
                return container;
            },
        });
        const control = new CustomControl();
        map.addControl(control);
        return () => map.removeControl(control);
    }, [map, isExpanded, toggleExpand, isDarkMode]);
    return null;
};

interface MapsProps {
    setoranRekap: SetoranRekap;
    setoranRekapTotal: SetoranRekapTotal[];
    periodes: Periode[];
    selectedPeriode: Periode | null;
}

const Maps: React.FC<MapsProps> = ({ setoranRekap, setoranRekapTotal, periodes, selectedPeriode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { t } = useTranslation('maps')
    const [map, setMap] = useState<L.Map | null>(null);
    const { isDarkMode } = useTheme();
    const [currentZoom, setCurrentZoom] = useState<number>(4.5);

    const { data, setData } = useForm({
        periode: selectedPeriode || '',
    });

    const toggleExpand = () => {
        setIsExpanded((prev) => {
            const newState = !prev;
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                }
            }, 0);
            return newState;
        });
    };

    useEffect(() => {
        document.body.classList.toggle('overflow-hidden', isExpanded);
        return () => document.body.classList.remove('overflow-hidden');
    }, [isExpanded]);

    useEffect(() => {
        setData('periode', selectedPeriode || '');
    }, [selectedPeriode]);

    useEffect(() => {
        if (!map) return;


        const handleZoomEnd = () => {
            const zoom = map.getZoom();
            setCurrentZoom(zoom);
            map.invalidateSize(); // Pastikan map dirender ulang dengan benar
        };

        map.on('zoomend', handleZoomEnd);

        // Set initial zoom level
        setCurrentZoom(map.getZoom());
        handleZoomEnd(); // Panggil sekali untuk set initial state

        // Cleanup
        return () => {
            map.off('zoomend', handleZoomEnd);
        };
    }, [map]);

    const handlePeriodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPeriode = e.target.value;
        setData('periode', newPeriode);
    };

    // Determine which data to display
    const mapData = data.periode ? setoranRekap[data.periode] : setoranRekapTotal;

    // console.log(setoranRekap["2025-08"])

    return (
        <div className={`mx-auto h-full w-full ${isExpanded ? 'fixed inset-0 z-40' : ''}`}>
            <div className={`h-full w-full overflow-hidden rounded-lg shadow-lg dark:bg-[rgb(38,45,52)] bg-white`}>
                {/* Header Card */}
                <div className={`flex items-center justify-between p-4 rounded-t-lg dark:bg-[rgb(38,45,52)] bg-white`}>
                    <h2 className={`text-xl font-semibold dark:text-white text-gray-800`}>{t("title")}</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => (window.location.href = '/dashboard')}
                            className={`rounded-full p-2 transition-colors hover:cursor-pointer dark:text-gray-300 hover:bg-gray-700 hover:text-white text-gray-600 dark:hover:bg-gray-100 hover:text-gray-900'}`}
                            aria-label="Go to dashboard"
                        >
                            <Grid2X2 className="h-5 w-5" />
                        </button>
                        <div className="relative group">
                            <select
                                value={data.periode}
                                onChange={handlePeriodeChange}
                                className={`appearance-none rounded-full p-2 pr-9 transition-colors group-hover:cursor-pointer  dark:text-gray-300 group-hover:bg-gray-700 text-gray-600 group-hover:text-gray-100`}
                                aria-label="Filter by period"
                            >
                                <option value="">{t("label")}</option>
                                {periodes.map((periode) => (
                                    <option key={periode} value={periode}>
                                        {new Date(periode + '-01').toLocaleString('id-ID', {
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </option>
                                ))}
                            </select>
                            <Calendar className={`pointer-events-none absolute top-1/2 right-2 h-5 w-5 -translate-y-1/2 transform dark:text-gray-300 group-hover:text-gray-100 text-gray-600`} />
                        </div>
                        {!isExpanded && (
                            <button
                                onClick={toggleExpand}
                                className={`rounded-full p-2 transition-colors hover:cursor-pointer dark:text-gray-300 hover:bg-gray-700 hover:text-white text-gray-600 dark:hover:bg-gray-100 hover:text-gray-900'}`}
                                aria-label="Expand map"
                            >
                                <Expand className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Map Container - No dark mode styling here */}
                <div className={`w-full px-5 ${isExpanded ? 'h-[calc(100vh-7rem)]' : 'h-107'}`}>
                    <MapContainer
                        center={[-2.5, 118]}
                        zoom={4.5}
                        minZoom={4}
                        maxBounds={INDONESIA_BOUNDS}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                        maxBoundsViscosity={1.0}
                        ref={setMap}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapBounds />
                        <MinimizeControl isExpanded={isExpanded} toggleExpand={toggleExpand} isDarkMode={isDarkMode} />
                        {mapData.flatMap((item) => {
                            if (currentZoom < 6) {
                                const setoranRekapTotal = item as SetoranRekapTotal
                                return (
                                    <Marker key={setoranRekapTotal.provinsi.id} position={[parseFloat(setoranRekapTotal.provinsi.latitude), parseFloat(setoranRekapTotal.provinsi.longitude)]}>
                                        <Popup>
                                            {setoranRekapTotal.provinsi.name}: {setoranRekapTotal.provinsi.total_setoran} setoran
                                        </Popup>
                                    </Marker>
                                )
                            } else {
                                if (Array.isArray(item.kota)) {
                                    return item.kota.map((k) => {
                                        return (
                                            <Marker key={k.kota} position={[k.lat, k.long]}>
                                                <Popup>
                                                    {k.kota}: {k.total_setoran} setoran
                                                </Popup>
                                            </Marker>
                                        )
                                    })
                                }
                            }
                        })}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default Maps;
