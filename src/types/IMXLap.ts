export interface IMXLap {
    date: number;
    cmd: string;
    base: number;
    device: number;
    time: number;
    status: number;
    lap_time: number;
    max_speed: number;
    sectors: number;
    // Подсчёт
    // last_time: number;
    // laps: number;
    // best_time: number;
    // best_speed: number;
    // total_time: number;
}
