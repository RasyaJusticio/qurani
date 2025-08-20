interface Kota {
    kota: string;
    lat: number;
    long: number;
    total_setoran: number;
}

interface Provinsi {
    id: number;
    name: string;
    country_id: number;
    alt_name: string;
    default: number;
    enabled: number;
    latitude: string;
    longitude: string;
    total_setoran: number;
}

export interface SetoranRekapTotal {
    kota: Kota[];
    provinsi: Provinsi;
}

export type SetoranRekap = {
    [periode: string]: {
        kota: Kota[];
        provinsi: Provinsi;
        periode?: string;
    };
};

export type Periode = string;
