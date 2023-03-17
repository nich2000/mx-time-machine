import { IGroup } from '@/types/IGroup';
import { TypeRaceStatus } from '@/types/TypeRaceStatus';
import { story } from '@/story/story';
// import { IMXLap } from '@/types/IMXLap';

export const invitationRaceAction = (group: IGroup): void => {
    window.api.ipcRenderer.send('race-invitation-request', group);
};

export const startRaceAction = (group: IGroup): void => {
    let devices: (number | undefined)[] = [];
    const g = story.groupInRace;
    if (g !== undefined) {
        for (let i = 0; i < g.sportsmen.length; i++) {
            if (g.sportsmen[i] !== undefined) {
                if (g.sportsmen[i].sportsman !== undefined) {
                    if (g.sportsmen[i].sportsman?.transponders[0] !== undefined) {
                        let id = g.sportsmen[i].sportsman?.transponders[0];
                        if (!devices.includes(id)) {
                            devices.push(id);
                        }
                    }
                }
            }
        }
    }

    // TODO При первом нажатии на старт список пустой. Потом всё ок.
    if (devices.length == 0) {
        return;
    }

    story.mxResults?.forEach(function (value, key) {
        story.mxResults?.delete(key);
    });

    window.api.ipcRenderer.send('race-start-request', group);

    window.api.ipcRenderer.send('MXAction', '', 'start', devices, 0, 0, 0, 0);
};

export const startSearchAction = (group: IGroup): void => {
    window.api.ipcRenderer.send('search-start-request', group);
};

export const stopRaceAction = (): void => {
    window.api.ipcRenderer.send('race-stop-request');

    let devices: (number | undefined)[] = [];
    const g = story.groupInRace;
    if (g !== undefined) {
        for (let i = 0; i < g.sportsmen.length; i++) {
            if (g.sportsmen[i] !== undefined) {
                if (g.sportsmen[i].sportsman !== undefined) {
                    if (g.sportsmen[i].sportsman?.transponders[0] !== undefined) {
                        let id = g.sportsmen[i].sportsman?.transponders[0];
                        if (!devices.includes(id)) {
                            devices.push(id);
                        }
                    }
                }
            }
        }
    }
    window.api.ipcRenderer.send('MXAction', '', 'stop', devices, 0, 0, 0, 0);

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
