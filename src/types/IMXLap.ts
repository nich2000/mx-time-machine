export interface IMXLap {
    base: number;
    cmd: string;
    date: number;
    device: number;
    lap_time: number;
    max_speed: number;
    num: number;
    sectors: number;
    session: string; // TODO rename to mxSessionId
    sportsman: string;
    status: number;
    time: number;
    // _id: string;
}
