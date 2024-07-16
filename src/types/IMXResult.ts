export interface IMXResult {
    best_speed: number;
    best_time: number;
    device: number;
    duplicate: number;
    finish_time: number;
    is_finished: boolean;
    lap_down_count: number;
    lap_time: number;
    laps: number;
    last_time: number;
    max_speed: number;
    plus_5sec_count: number;
    refresh_time: number;
    session: string; // TODO rename to mxSessionId
    sportsman: string;
    total_time: number;
    // _id: string;
}
