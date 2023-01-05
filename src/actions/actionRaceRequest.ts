import { IGroup } from '@/types/IGroup';
import { TypeRaceStatus } from '@/types/TypeRaceStatus';
import { story } from '@/story/story';
// import { IMXLap } from '@/types/IMXLap';

export const invitationRaceAction = (group: IGroup): void => {
    window.api.ipcRenderer.send('race-invitation-request', group);
};

export const startRaceAction = (group: IGroup): void => {
    window.api.ipcRenderer.send('race-start-request', group);

    story.mxResults?.forEach(function (value, key) {
        story.mxResults?.delete(key);
    });

    window.api.ipcRenderer.send('MXAction', '', 'start', []);
};

export const startSearchAction = (group: IGroup): void => {
    window.api.ipcRenderer.send('search-start-request', group);
};

export const stopRaceAction = (): void => {
    window.api.ipcRenderer.send('race-stop-request');

    window.api.ipcRenderer.send('MXAction', '', 'stop', []);

    window.api.ipcRenderer.send('MXResult', JSON.stringify(story.mxResults));
};

export const getStartTimeAction = (): Promise<number> => {
    return window.api.ipcRenderer.invoke('handle-race-start-time-request');
};

export const getRaceStatusAction = (): Promise<TypeRaceStatus> => {
    return window.api.ipcRenderer.invoke('handle-race-status-request');
};

export const getGroupInRaceAction = (): Promise<IGroup> => {
    return window.api.ipcRenderer.invoke('handle-group-in-race-request');
};
