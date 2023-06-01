export interface IMXDevice {
    pingTime: number;
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
    snr: number;
    connected: number;
}
