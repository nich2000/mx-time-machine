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

function gps_to_millis(gps: number) {
    let _time = gps;
    let _h = Math.trunc(_time / 1000000);
    let _m = Math.trunc((_time - _h * 1000000) / 10000);
    let _s = Math.trunc((_time - _h * 1000000 - _m * 10000) / 100);
    let _ms = (_time % 100) * 10;

    // Учитываем часовой пояс
    _h += 3;
    if (_h > 24) {
        _h -= 24;
    }

    console.log('g', _h, _m, _s, _ms);

    return (_h * 3600 + _m * 60 + _s) * 1000 + _ms;
}

function unix_to_millis(unix: number) {
    const _time = new Date(unix);
    let _h = _time.getHours();
    let _m = _time.getMinutes();
    let _s = _time.getSeconds();
    let _ms = Math.trunc((unix % 1000000) / 1000);

    console.log('u', _h, _m, _s, _ms);

    return (_h * 3600 + _m * 60 + _s) * 1000 + _ms;
}

export class Story {
    public competitions: Array<ICompetition> = [];
    public sportsmen: Array<ISportsman> = [];
    public teams: Array<ITeam> = [];
    public competition: ICompetition | undefined = undefined;
    public rounds: Array<IRound> = [];
    public groups: Array<IGroup> = [];
    public reports: Array<IReport> = [];
    public broadCasts: Array<IBroadCast> = [];
    public laps: Array<ILap> = [];
    public raceStatus: TypeRaceStatus | undefined = undefined;
    public serialPortStatus: ISerialPortStatus | undefined = undefined;
    public wlanStatus: IWlanStatus | undefined = undefined;
    public mxBase: IMXBase | undefined = undefined;
    public mxDevices: Map<number, IMXDevice> | undefined;
    public mxResults: Map<number, IMXLap> | undefined;
    public connected: boolean = false;
    public startTime: number | undefined = undefined;
    public groupInRace: IGroup | undefined = undefined;
    public connectorMessage: string | undefined = undefined;

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
        // console.log(this.raceStatus);
        // console.log(this.startTime);

        if (this.mxResults === undefined) {
            this.mxResults = new Map<number, IMXLap>();
        }
        let lap = this.mxResults.get(newMXLap.device);
        if (lap !== undefined) {
            lap.cmd = newMXLap.cmd;
            lap.base = newMXLap.base;
            lap.device = newMXLap.device;
            lap.time = newMXLap.time;
            lap.status = newMXLap.status;
            lap.lap_time = newMXLap.lap_time;
            lap.max_speed = newMXLap.max_speed;
            lap.sectors = newMXLap.sectors;

            lap.lap_time = gps_to_millis(lap.time) - gps_to_millis(lap.last_time);
            lap.last_time = lap.time; // ms

            lap.laps += 1;
            if (lap.lap_time < lap.best_time) {
                lap.best_time = lap.lap_time; // ms
            }
            if (lap.max_speed > lap.best_speed) {
                lap.best_speed = lap.max_speed; // ms
            }
            lap.total_time += lap.lap_time; // ms
        } else {
            lap = { ...newMXLap };

            if (this.startTime !== undefined) {
                lap.lap_time = gps_to_millis(lap.time) - unix_to_millis(this.startTime);
            } else {
                lap.lap_time = 0;
            }
            lap.last_time = lap.time; // ms

            lap.laps = 1;
            lap.best_time = lap.lap_time; // ms
            lap.best_speed = lap.max_speed;
            lap.total_time = lap.lap_time; // ms
        }

        // console.log(lap);
        this.mxResults.set(lap.device, lap);

        let cloneLap = { ...lap };
        // const cloneLap = Object.assign({}, lap)
        // const cloneLap = JSON.parse(JSON.stringify(lap));
        // const cloneLap = _.cloneDeep(lap)
        mxLapInsertAction(cloneLap);

        let result: IMXResult = {
            date: 123,
            device: lap.device,
            sportsman: '',
            laps: lap.laps,
            best_speed: lap.best_speed,
            lap_time: lap.lap_time,
            best_time: lap.best_speed
        };
        mxResultSetAction(lap.device, result);
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
