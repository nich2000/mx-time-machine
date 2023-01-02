export interface IMXDevice {
    cmd: string;
    base: number;
    device: number;
    status: number;
    version: number;
    battery: number;
    time: string
    lat: number;
    lon: number;
    rssi: number;
}
