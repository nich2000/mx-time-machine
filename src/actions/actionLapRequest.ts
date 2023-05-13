import _ from 'lodash';
import { ILap } from '@/types/ILap';
import { IRound } from '@/types/IRound';
import { IMXLap } from '@/types/IMXLap';
import { IMXResult } from '@/types/IMXResult';

export const loadLapsForGroupAction = (_id: string): void => {
    window.api.ipcRenderer.send('load-laps-for-group-request', _id);
};

export const loadLapsForRoundAction = (roundId: string): Promise<Array<ILap>> => {
    return window.api.ipcRenderer.invoke('handle-load-laps-for-round-request', roundId);
};

export const loadLapsForRoundsAction = (rounds: IRound[]): Promise<Array<ILap>> => {
    return window.api.ipcRenderer.invoke(
        'handle-load-laps-for-rounds-request',
        _.cloneDeep(rounds || []).map((round) => round._id)
    );
};

export const lapUpdateAction = (_id: string, lap: Pick<ILap, 'typeLap' | 'gateId' | 'timeLap'>): void => {
    window.api.ipcRenderer.send('lap-update-request', _id, lap);
};

export const lapInsertAction = (lap: Omit<ILap, '_id'>): void => {
    window.api.ipcRenderer.send('lap-insert-request', lap);
};

export const lapDeleteAction = (_id: string): void => {
    window.api.ipcRenderer.send('lap-delete-request', _id);
};

export const mxResultSetAction = (device: number, session: string, result: IMXResult): void => {
    window.api.ipcRenderer.send('mx-result-set-request', device, session, result);
};

export const mxLapInsertAction = (lap: IMXLap): void => {
    window.api.ipcRenderer.send('mx-lap-insert-request', lap);
};
