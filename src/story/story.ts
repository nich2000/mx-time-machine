import _ from 'lodash';
import { makeAutoObservable } from 'mobx';
import { ICompetition } from '@/types/ICompetition';
import { IRound } from '@/types/IRound';
import { ISportsman } from '@/types/ISportsman';
import { ITeam } from '@/types/ITeam';
import { IGroup } from '@/types/IGroup';
import { ILap } from '@/types/ILap';
import { TypeRaceStatus } from '@/types/TypeRaceStatus';
import { ISerialPortStatus } from '@/types/ISerialPortStatus';
import { IWlanStatus } from '@/types/IWlanStatus';
import { IMXDevice } from '@/types/IMXDevice';
import { IMXBase } from '@/types/IMXBase';
import { IMXLap } from '@/types/IMXLap';
import { IReport } from '@/types/IReport';
import { IBroadCast } from '@/types/IBroadCast';
import { mxLapInsertAction } from '@/actions/actionLapRequest';
import { mxResultSetAction } from '@/actions/actionLapRequest';
import { IMXResult } from '@/types/IMXResult';
import { beep } from '@/utils/beep';
import { sportsmanName } from '@/utils/sportsmanName';
import { DateTime } from 'luxon';

function gps_to_millis(gps: number) {
    let _time = gps;
    let _h = Math.trunc(_time / 1000000);
    let _m = Math.trunc((_time - _h * 1000000) / 10000);
    let _s = Math.trunc((_time - _h * 1000000 - _m * 10000) / 100);
    let _ms = (_time % 100) * 10;

    // Учитываем часовой пояс
    const __time = new Date(DateTime.now().toMillis());
    const __h = __time.getHours();
    // Если время совпадает, значит это эмуляция
    if (_h !== __h) {
        const d = new Date();
        const offset = d.getTimezoneOffset() / 60;

        // _h += 3; // Москва
        // _h += 4; // Дубай
        _h += offset; // TODO Проверить
        if (_h > 24) {
            _h -= 24;
        }
    }

    console.log('gps', gps, _h, _m, _s, _ms);

    return (_h * 3600 + _m * 60 + _s) * 1000 + _ms;
}

function unix_to_millis(unix: number) {
    const _time = new Date(unix);
    let _h = _time.getHours();
    let _m = _time.getMinutes();
    let _s = _time.getSeconds();
    let _ms = Math.trunc((unix % 1000000) / 1000);

    console.log('unix', _h, _m, _s, _ms);

    return (_h * 3600 + _m * 60 + _s) * 1000 + _ms;
}

// mxChampionship
//   competition
//     rounds
//       mxSession

export class Story {
    public broadCasts: Array<IBroadCast> = [];
    public competition: ICompetition | undefined = undefined;
    public competitions: Array<ICompetition> = [];
    public connected: boolean = false;
    public connectorMessage: string | undefined = undefined;
    public curSession: string = '';
    public groupInRace: IGroup | undefined = undefined;
    public groups: Array<IGroup> = [];
    public laps: Array<ILap> = [];
    public mxBase: IMXBase | undefined = undefined; // TODO use connected
    public mxChampionship: any | undefined = undefined;
    public mxDevices: Map<number, IMXDevice> | undefined;
    public mxLaps: Map<number, Map<number, IMXLap>> | undefined;
    public mxResults: Map<number, IMXResult> | undefined;
    public mxSession: any | undefined = undefined;
    public raceStatus: TypeRaceStatus | undefined = undefined;
    public reports: Array<IReport> = [];
    public rounds: Array<IRound> = [];
    public serialPortStatus: ISerialPortStatus | undefined = undefined;
    public sportsmen: Array<ISportsman> = [];
    public startTime: number | undefined = undefined;
    public teams: Array<ITeam> = [];
    public wlanStatus: IWlanStatus | undefined = undefined;

    public constructor() {
        makeAutoObservable(this);
    }

    public setCompetition = (newCompetition: ICompetition): void => {
        this.competition = newCompetition;
    };

    public setCompetitions = (newCompetitions: ICompetition[]): void => {
        this.competitions = newCompetitions;
    };

    public setSportsmen = (newSportsmen: ISportsman[]): void => {
        this.sportsmen = newSportsmen;
    };

    public setTeams = (newTeams: ITeam[]): void => {
        this.teams = newTeams;
    };

    public setRounds = (newRounds: IRound[]): void => {
        this.rounds = newRounds;
    };

    public setGroups = (newGroups: IGroup[]): void => {
        this.groups = newGroups;
    };

    public setReports = (newReports: IReport[]): void => {
        this.reports = newReports;
    };

    public setBroadCasts = (newBroadCasts: IBroadCast[]): void => {
        this.broadCasts = newBroadCasts;
    };

    public setLaps = (newLaps: ILap[]): void => {
        this.laps = newLaps;
    };

    public setRaceStatus = (RaceStatus: TypeRaceStatus): void => {
        this.raceStatus = RaceStatus;
    };

    public setSerialPortStatus = (newSerialPortStatus: ISerialPortStatus): void => {
        this.serialPortStatus = newSerialPortStatus;
    };

    public setWlanStatus = (newWlanStatus: IWlanStatus): void => {
        this.wlanStatus = newWlanStatus;
    };

    public setMXBase = (newMXBase: IMXBase): void => {
        this.mxBase = newMXBase;
    };

    public setMXDevice = (newMXDevice: IMXDevice): void => {
        if (this.mxDevices === undefined) {
            this.mxDevices = new Map<number, IMXDevice>();
        }
        this.mxDevices.set(newMXDevice.device, newMXDevice);
    };

    public setMXLap = (newMXLap: IMXLap): void => {
        // Все круги
        if (this.mxLaps === undefined) {
            this.mxLaps = new Map<number, Map<number, IMXLap>>();
        }
        // Круги для девайса
        if (this.mxLaps.get(newMXLap.device) === undefined) {
            this.mxLaps.set(newMXLap.device, new Map<number, IMXLap>());
        }
        let laps = this.mxLaps.get(newMXLap.device);
        let duplicate = false;
        if (laps !== undefined) {
            // Конкретный круг девайса
            if (laps.get(newMXLap.time) !== undefined) {
                // Дубль
                duplicate = true;

                beep(50, 1000, 1, 'square');
            } else {
                newMXLap.session = story.curSession;

                laps.set(newMXLap.time, { ...newMXLap });

                // let cloneLap = { ...lap };
                // const cloneLap = Object.assign({}, lap)
                // const cloneLap = JSON.parse(JSON.stringify(lap));
                // const cloneLap = _.cloneDeep(lap)
                mxLapInsertAction({ ...newMXLap });

                beep(50, 1000, 1, 'sine');
            }
        }

        // Сводная информация
        if (this.mxResults === undefined) {
            this.mxResults = new Map<number, IMXResult>();
        }
        // Результаты конкретного девайса
        let result = this.mxResults.get(newMXLap.device);
        if (result !== undefined) {
            if (!duplicate) {
                result.laps += 1;
                result.duplicate = 1;
                result.max_speed = newMXLap.max_speed;
                if (newMXLap.max_speed > result.best_speed || result.best_speed == 0) {
                    result.best_speed = newMXLap.max_speed; // ms
                }
                // ms
                result.lap_time = gps_to_millis(newMXLap.time) - gps_to_millis(result.last_time);
                // ms
                if (result.lap_time < result.best_time) {
                    result.best_time = result.lap_time;
                }
                // ms
                result.total_time += result.lap_time;
                // gps
                result.last_time = newMXLap.time;
                // time
                result.refresh_time = Date.now();
            } else {
                result.duplicate += 1;
            }
        } else {
            let sportsman: string = '';
            for (let i = 0; i < story.sportsmen.length; i++) {
                let needBreak = false;
                for (let j = 0; j < story.sportsmen[i].transponders.length; j++) {
                    if (story.sportsmen[i].transponders[j] == newMXLap.device) {
                        sportsman = sportsmanName(story.sportsmen[i]);
                        needBreak = true;
                        break;
                    }
                }
                if (needBreak) {
                    break;
                }
            }

            // 8121000
            // 83702502
            result = {
                session: story.curSession,
                sportsman: sportsman,
                device: newMXLap.device,
                laps: 1,
                duplicate: 1,
                max_speed: newMXLap.max_speed,
                best_speed: newMXLap.max_speed,
                // ms
                lap_time:
                    this.startTime !== undefined ? gps_to_millis(newMXLap.time) - unix_to_millis(this.startTime) : 1,
                // ms
                best_time:
                    this.startTime !== undefined ? gps_to_millis(newMXLap.time) - unix_to_millis(this.startTime) : 1,
                // ms
                total_time:
                    this.startTime !== undefined ? gps_to_millis(newMXLap.time) - unix_to_millis(this.startTime) : 1,
                // gps
                last_time: newMXLap.time,
                // time
                refresh_time: Date.now()
            };
        }
        if (!duplicate) {
            this.mxResults.set(result.device, result);
            mxResultSetAction(result.device, result.session, { ...result });
        }
    };

    public setConnected = (newConnected: boolean): void => {
        this.connected = newConnected;
    };

    public setStartTime = (newStartTime: number | undefined): void => {
        this.startTime = newStartTime;
    };

    public setGroupInRace = (newGroupInRace: IGroup | undefined): void => {
        this.groupInRace = newGroupInRace;
    };

    public setConnectorMessage = (newConnectorMessage: string | undefined): void => {
        this.connectorMessage = newConnectorMessage;
    };
}

export const story = new Story();
