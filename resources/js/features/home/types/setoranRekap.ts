export type SetoranRekap = {
    kota: string;
    lat: number;
    long: number;
    total_setoran: number;
    periode?: string;
};

export type Periode = string;

export type SetoranRekapTotal = SetoranRekap;
