import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { IRound } from '@/types/IRound';
import { Tabs, Tab, Button, Box, Tooltip } from '@mui/material';
import Button1 from '@mui/material/Button';
import { observer } from 'mobx-react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { roundUpdateAction } from '@/actions/actionRoundRequest';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import styles from './styles.module.scss';
import { story } from '@/story/story';

interface IProps {
    rounds: IRound[];
    selectedId: string | undefined;
    onSelect: (_id: string) => void;
    onAddRound: () => void;
    onEditRound: (_id: string) => void;
}

export const TabRounds: FC<IProps> = observer(({ rounds, selectedId, onSelect, onAddRound, onEditRound }: IProps) => {
    const [innerRounds, setInnerRounds] = useState(_.cloneDeep(rounds));
    const draggedItem = useRef<string | undefined>(undefined);
    const handleSelect = useCallback((event: React.SyntheticEvent, _id: string) => onSelect(_id), [onSelect]);
    const handleEditRound = useCallback(() => {
        if (selectedId) {
            onEditRound(selectedId);
        }
    }, [onEditRound, selectedId]);

    const onDragItemStart = useCallback(
        (id: string) => (e: React.DragEvent<HTMLDivElement>) => {
            draggedItem.current = id;
            e.dataTransfer.effectAllowed = 'move';
        },
        []
    );

    const onDragItemOver = useCallback(
        (id: string) => (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            const index = _.findIndex(innerRounds, (item) => item._id === id);
            if (!draggedItem.current || draggedItem.current === innerRounds[index]._id) {
                return;
            }
            const oldIndex = _.findIndex(innerRounds, (item) => item._id === draggedItem.current);
            [innerRounds[index], innerRounds[oldIndex]] = [innerRounds[oldIndex], innerRounds[index]];
            setInnerRounds(innerRounds.map((round, indx) => ({ ...round, sort: indx })));
        },
        [innerRounds]
    );

    const onDragItemEnd = () => {
        draggedItem.current = undefined;
        innerRounds.forEach((round) => roundUpdateAction(round._id, { sort: round.sort }));
    };

    useEffect(() => {
        setInnerRounds(rounds);
    }, [rounds]);

    function MXActionButton(action: string, label: string, Component: any) {
        const [open, setOpen] = React.useState(false);

        const handleClickOpen = () => {
            // setOpen(true);

            let devices: (number | undefined)[] = [];
            for (let j = 0; j < story.groups.length; j++) {
                const g = story.groups[j];
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

            window.api.ipcRenderer.send(
                'MXAction',
                '',
                'config',
                devices,
                story.competition?.latitude,
                story.competition?.longitude,
                story.competition?.radius,
                story.competition?.course,
                story.competition?.delay
            );
            window.api.ipcRenderer.send(
                'MXAction',
                '',
                'list',
                devices,
                story.competition?.latitude,
                story.competition?.longitude,
                story.competition?.radius,
                story.competition?.course,
                story.competition?.delay
            );
        };

        const handleDisagree = () => {
            setOpen(false);
        };

        const handleAgree = () => {
            setOpen(false);

            let devices: (number | undefined)[] = [];
            for (let j = 0; j < story.groups.length; j++) {
                const g = story.groups[j];
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

            // window.api.ipcRenderer.send('MXAction', '', action, devices, 0, 0, 0, 0);
            window.api.ipcRenderer.send(
                'MXAction',
                '',
                'config',
                devices,
                story.competition?.latitude,
                story.competition?.longitude,
                story.competition?.radius,
                story.competition?.course,
                story.competition?.delay
            );
            window.api.ipcRenderer.send(
                'MXAction',
                '',
                'list',
                devices,
                story.competition?.latitude,
                story.competition?.longitude,
                story.competition?.radius,
                story.competition?.course,
                story.competition?.delay
            );
        };

        function handleClose() {
            setOpen(false);
        }

        return (
            <div style={{ display: 'flex' }}>
                <Button
                    color="primary"
                    startIcon={<Component />}
                    onClick={handleClickOpen}
                    disabled={!story?.mxBase?.connected}
                >
                    {label}
                </Button>

                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    {/*<DialogTitle id="alert-dialog-title">{`Send command "${action}" to device group?`}</DialogTitle>*/}
                    <DialogTitle id="alert-dialog-title">{`Send config to devices?`}</DialogTitle>
                    <DialogActions>
                        <Button1 onClick={handleDisagree}>NO</Button1>
                        <Button1 onClick={handleAgree} autoFocus>
                            YES
                        </Button1>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <div className={styles.root}>
                <Tabs value={selectedId} onChange={handleSelect} variant="scrollable" scrollButtons="auto">
                    {innerRounds.map((round) => (
                        // @ts-ignore
                        <Tab
                            draggable="true"
                            onDragStart={onDragItemStart(round._id)}
                            onDragOver={onDragItemOver(round._id)}
                            onDragEnd={onDragItemEnd}
                            key={round._id}
                            label={round.name}
                            value={round._id}
                            id={round._id}
                        />
                    ))}
                </Tabs>
                <div className={styles.actions}>
                    {/*{!!selectedId && (*/}
                    {/*<Tooltip title="Send device list to base">*/}
                    {/*    {MXActionButton('list', 'Send list', FormatListNumberedIcon)}*/}
                    {/*</Tooltip>*/}
                    {/*)}*/}
                    {/*{!!selectedId && (*/}
                    <Tooltip title="Send config to base">
                        {MXActionButton('config', 'Config base', SettingsSuggestIcon)}
                    </Tooltip>
                    {/*)}*/}
                    {!!selectedId && (
                        <Button color="primary" startIcon={<EditIcon />} onClick={handleEditRound}>
                            Edit round
                        </Button>
                    )}
                    <Button color="primary" startIcon={<AddIcon />} onClick={onAddRound}>
                        Add round
                    </Button>
                </div>
            </div>
        </Box>
    );
});
