// TODO убрать эти костыли!
export interface IMXLap {
    // Пакет
    cmd: string;
    base: number;
    device: number;
    time: string;
    lap_time: number;
    max_speed: number;
    sectors: number;
    status: number;
    // Подсчёт
    laps: number;
    best_time: number;
    best_speed: number;
    total_time: number;
}
