export interface IMXLap {
    date: number;
    // Пакет
    cmd: string;
    base: number;
    device: number;
    time: number;
    status: number;
    // Возможно прилетать не будет вовсе
    lap_time: number;
    max_speed: number;
    sectors: number;
    // Подсчёт
    last_time: number;
    laps: number;
    best_time: number;
    best_speed: number;
    total_time: number;
}
