import React, { FC, useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';

import { TabRounds } from '@/modules/rounds/components/TabRounds/TabRounds';
import { story } from '@/story/story';
import { IRound } from '@/types/IRound';
import {
    groupDeleteAction,
    groupInsertAction,
    groupSelectAction,
    groupUpdateAction,
    loadLapsForGroupAction
} from '@/actions/actionRequest';
import { Button, Grid, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DialogFormRound } from '@/modules/rounds/components/DialogFormRound/DialogFormRound';
import { ListGroups } from '@/modules/rounds/components/ListGroups/ListGroups';
import { DialogFormGroup } from '@/modules/rounds/components/DialogFormGroup/DialogFormGroup';
import { IGroup } from '@/types/IGroup';
import { TableLaps } from '@/modules/rounds/components/TableLaps/TableLaps';
import { TableMXResults } from '@/modules/rounds/components/TableMXResults/TableMXResults';
import {
    roundDeleteAction,
    roundInsertAction,
    roundSelectAction,
    roundUpdateAction
} from '@/actions/actionRoundRequest';
import {
    invitationRaceAction,
    newSessionAction,
    startRaceAction,
    startSearchAction,
    stopRaceAction
} from '@/actions/actionRaceRequest';
import { TypeRaceStatus } from '@/types/TypeRaceStatus';
import { StopWatch } from '@/modules/rounds/components/StopWatch/StopWatch';

import styles from './styles.module.scss';
import { sportsmanName } from '@/utils/sportsmanName';
import { ColorCss } from '@/types/Color';
import { DialogChangePositionsInGroup } from '@/modules/rounds/components/DialogChangePositionsInGroup/DialogChangePositionsInGroup';
import { dateTimeStr } from '@/utils/dateTimeUtils';
import { DateTime } from 'luxon';
import { ContentCopy, ContentPaste } from '@mui/icons-material';

export const RoundsContainer: FC = observer(() => {
    const [openDialogAddRound, setOpenDialogAddRound] = useState(false);
    const [openDialogEditRound, setOpenDialogEditRound] = useState(false);
    const [openDialogAddGroup, setOpenDialogAddGroup] = useState(false);
    const [openDialogEditGroup, setOpenDialogEditGroup] = useState<IGroup>();
    const [openDialogChangePositions, setOpenDialogChangePositions] = useState<IGroup>();

    const sportsmen = _.sortBy(story.sportsmen, 'lastName');
    const teams = _.sortBy(story.teams, 'name');

    const rounds = [...(story.rounds || [])].sort((a, b) => a.sort - b.sort);

    const groups = [...(story.groups || [])];
    // let groups = [...(story.groups || [])];
    // const tmp_groups = [...(story.groups || [])];
    // const [groups, setGroups] = useState<IGroup[]>(tmp_groups);

    const selectedRound = rounds.find((round) => round.selected);
    const selectedGroup = groups.find((group) => group.selected);
    const raceReadyToStart = !story.raceStatus || story.raceStatus === TypeRaceStatus.STOP;

    const handleSelectRound = useCallback(async (_id: string) => {
        if (story.competition) {
            roundSelectAction(story.competition._id, _id);
        }
    }, []);

    const handleOpenAddRound = useCallback(() => setOpenDialogAddRound(true), []);
    const handleOpenEditRound = useCallback(() => setOpenDialogEditRound(true), []);
    const handleOpenAddGroup = useCallback(() => setOpenDialogAddGroup(true), []);

    const handleOpenEditGroup = useCallback(
        (id: string) => {
            setOpenDialogEditGroup(_.find(groups, ['_id', id]));
        },
        [groups]
    );

    const handleOpenChangePositions = useCallback(
        (id: string) => {
            setOpenDialogChangePositions(_.find(groups, ['_id', id]));
        },
        [groups]
    );

    const handleCloseDialog = useCallback(() => {
        setOpenDialogAddRound(false);
        setOpenDialogEditRound(false);
        setOpenDialogAddGroup(false);
        setOpenDialogChangePositions(undefined);
        setOpenDialogEditGroup(undefined);
    }, []);

    const handleAddRound = useCallback(
        async (
            round: Omit<IRound, '_id' | 'competitionId' | 'selected' | 'dateCreate' | 'minTimeLap' | 'close' | 'sort'>
        ) => {
            if (story.competition && round.name) {
                roundInsertAction(story.competition._id, round);
                handleCloseDialog();
            }
        },
        [handleCloseDialog]
    );

    const handleEditRound = useCallback(
        async (
            round: Omit<IRound, '_id' | 'competitionId' | 'selected' | 'dateCreate' | 'minTimeLap' | 'close' | 'sort'>
        ) => {
            if (story.competition && selectedRound && round.name) {
                roundUpdateAction(selectedRound._id, round);
                handleCloseDialog();
            }
        },
        [selectedRound, handleCloseDialog]
    );

    const handleDeleteRound = useCallback(
        async (_id: string) => {
            if (
                story.competition &&
                window.confirm(
                    'Are you sure you want to delete the round? All groups and laps will be deleted with him!'
                )
            ) {
                roundDeleteAction(_id);
                handleCloseDialog();
            }
        },
        [handleCloseDialog]
    );

    const handleAddGroup = useCallback(
        (
            group: Omit<
                IGroup,
                '_id' | 'competitionId' | 'roundId' | 'close' | 'sort' | 'timeStart' | 'startMillisecond'
            >
        ) => {
            if (story.competition && selectedRound && group.name) {
                groupInsertAction({
                    ...group,
                    close: false,
                    roundId: selectedRound._id,
                    competitionId: story.competition._id,
                    sort: (groups || []).length > 0 ? groups[groups.length - 1].sort + 1 : 1
                });
            }
            handleCloseDialog();
        },
        [groups, handleCloseDialog, selectedRound]
    );

    const handleEditGroup = useCallback(
        (
            _id: string,
            group: Omit<
                IGroup,
                '_id' | 'competitionId' | 'roundId' | 'close' | 'sort' | 'timeStart' | 'startMillisecond'
            >
        ) => {
            if (story.competition && group.name) {
                groupUpdateAction(_id, group);
            }
            handleCloseDialog();
        },
        [handleCloseDialog]
    );

    const handleSelectGroup = useCallback(
        (_id: string) => {
            if (story.competition && selectedRound) {
                groupSelectAction(selectedRound._id, _id);
            }
        },
        [selectedRound]
    );

    const handleDeleteGroup = useCallback(
        (_id: string) => {
            if (
                story.competition &&
                selectedRound &&
                window.confirm('Are you sure you want to delete the group? All laps will be deleted with him!')
            ) {
                groupDeleteAction(_id);
            }
        },
        [selectedRound]
    );

    const handleMXAction = useCallback(
        (_id: string, action: string, devices: any) => {
            window.api.ipcRenderer.send('MXAction', _id, action, devices, 0, 0, 0, 0);
        },
        [selectedRound]
    );

    // const handleInvitationRace = useCallback(() => {
    //     if (selectedGroup) {
    //         if (raceReadyToStart) {
    //             invitationRaceAction({
    //                 ..._.cloneDeep(selectedGroup),
    //                 competition: _.cloneDeep(story.competition),
    //                 round: _.cloneDeep(selectedRound)
    //             });
    //         }
    //     }
    // }, [raceReadyToStart, selectedGroup, selectedRound]);

    // function generateUUID(): string {
    //     let d = new Date().getTime();
    //     let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
    //     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    //         let r = Math.random() * 16;
    //         if(d > 0){
    //             r = (d + r)%16 | 0;
    //             d = Math.floor(d/16);
    //         } else {
    //             r = (d2 + r)%16 | 0;
    //             d2 = Math.floor(d2/16);
    //         }
    //         return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    //     });
    // }

    const handleStartRace = useCallback(() => {
        if (selectedGroup) {
            if (
                raceReadyToStart &&
                (story.laps?.length > 0
                    ? window.confirm('There is lap data in the group, if you restart the race it will be deleted!')
                    : true)
            ) {
                story.mxLaps?.clear();

                story.curMXSession = dateTimeStr();

                story.startTime = DateTime.now().toMillis();

                newSessionAction({
                    sessionId: story.curMXSession,
                    roundId: selectedRound?._id,
                    roundName: selectedRound?.name,
                    competitionId: story.competition?._id,
                    competitionName: story.competition?.name
                });

                startRaceAction({
                    ..._.cloneDeep(selectedGroup),
                    competition: _.cloneDeep(story.competition),
                    round: _.cloneDeep(selectedRound)
                });
            } else {
                stopRaceAction();

                story.curMXSession = '';

                story.finishTime = DateTime.now().toMillis();
            }
        }
    }, [raceReadyToStart, selectedGroup, selectedRound]);

    // const handleStartSearch = useCallback(() => {
    //     if (selectedGroup) {
    //         if (raceReadyToStart) {
    //             startSearchAction(_.cloneDeep(selectedGroup));
    //         } else {
    //             stopRaceAction();
    //         }
    //     }
    // }, [raceReadyToStart, selectedGroup]);

    const handleCopyListGroups = useCallback(() => {
        // const textGroups = groups
        //     .map(
        //         (group) =>
        //             group.name +
        //             ':\n' +
        //             [...group.sportsmen, ...group.teams]
        //                 .map(
        //                     (item) =>
        //                         `    ${item.startNumber || ''} - ${item.team?.name || sportsmanName(item?.sportsman!)}${
        //                             item.color !== undefined ? ` ${ColorCss[item.color]}` : ''
        //                         }  ${item.channel}`
        //                 )
        //                 .join('\n')
        //     )
        //     .join('\n');

        const textGroups = JSON.stringify(groups);

        // navigator.clipboard.writeText(textGroups).then(() => alert('Group list copied to clipboard.'));
        navigator.clipboard.writeText(textGroups).then(() => {});
    }, [groups]);

    function omit(key: string, obj: any) {
        const { [key]: omitted, ...rest } = obj;
        return rest;
    }

    const handlePasteListGroups = useCallback(() => {
        navigator.clipboard.readText().then((copiedText) => {
            let tmpGroups = JSON.parse(copiedText);
            // console.log(tmpGroups);

            for (let i = 0; i < tmpGroups.length; i++) {
                let group = omit('_id', tmpGroups[i]);
                // console.log(group);

                if (group.roundId !== selectedRound?._id) {
                    group.roundId = selectedRound?._id;
                    group.round = _.cloneDeep(selectedRound);
                    // group.round = { ...selectedRound };

                    group.competitionId = story.competition?._id;
                    group.competition = _.cloneDeep(story.competition);
                    // group.competition = { ...story.competition };

                    console.log(group);
                    groupInsertAction({ ...group });
                }
            }
        });
    }, [groups]);

    useEffect(() => {
        if (selectedGroup) {
            loadLapsForGroupAction(selectedGroup._id);

            story.setGroupInRace(selectedGroup);

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
        }
    }, [selectedGroup]);

    return (
        <div className={styles.root}>
            <TabRounds
                rounds={rounds}
                selectedId={selectedRound?._id}
                onSelect={handleSelectRound}
                onAddRound={handleOpenAddRound}
                onEditRound={handleOpenEditRound}
            />
            {(rounds || []).length === 0 && <div className={styles.empty}>No groups</div>}
            {selectedRound && (
                <Grid container spacing={2} className={styles.container}>
                    <Grid item xs={6} className={styles.groupsContainer}>
                        <div className={styles.actionGroups}>
                            <Tooltip title="Copy group list">
                                <Button color="primary" startIcon={<ContentCopy />} onClick={handleCopyListGroups}>
                                    Copy
                                </Button>
                            </Tooltip>
                            <Tooltip title="Paste group list">
                                <Button color="primary" startIcon={<ContentPaste />} onClick={handlePasteListGroups}>
                                    Paste
                                </Button>
                            </Tooltip>
                            {/*<Tooltip title="Send device list to base">*/}
                            {/*    <Button*/}
                            {/*        color="primary"*/}
                            {/*        startIcon={<FormatListNumberedIcon />}*/}
                            {/*        onClick={handleOpenAddGroup}*/}
                            {/*    >*/}
                            {/*        Send list*/}
                            {/*    </Button>*/}
                            {/*</Tooltip>*/}
                            {/*<Tooltip title="Send devices config to base">*/}
                            {/*    <Button*/}
                            {/*        color="primary"*/}
                            {/*        startIcon={<SettingsSuggestIcon />}*/}
                            {/*        onClick={handleOpenAddGroup}*/}
                            {/*    >*/}
                            {/*        Send config*/}
                            {/*    </Button>*/}
                            {/*</Tooltip>*/}
                            <Tooltip title="Add group">
                                <Button color="primary" startIcon={<AddIcon />} onClick={handleOpenAddGroup}>
                                    Add group
                                </Button>
                            </Tooltip>
                        </div>
                        <ListGroups
                            groups={groups}
                            selectedGroup={selectedGroup}
                            groupInRace={story.groupInRace}
                            onSelect={handleSelectGroup}
                            onDelete={handleDeleteGroup}
                            onEdit={handleOpenEditGroup}
                            onUpdate={handleEditGroup}
                            onMXAction={handleMXAction}
                            competition={story.competition!}
                        />
                    </Grid>
                    <Grid item xs={6} className={styles.containerRace}>
                        {selectedGroup && (
                            <div className={styles.race}>
                                <div className={styles.actionRace}>
                                    {/*<Button*/}
                                    {/*    variant="contained"*/}
                                    {/*    className={styles.startSearch}*/}
                                    {/*    onClick={handleStartSearch}*/}
                                    {/*    disabled={!raceReadyToStart || !story.connected}*/}
                                    {/*>*/}
                                    {/*    SEARCH*/}
                                    {/*</Button>*/}
                                    <StopWatch
                                        round={selectedRound}
                                        raceStatus={story.raceStatus}
                                        startTime={story.startTime}
                                    />
                                    {/*<Button*/}
                                    {/*    variant="contained"*/}
                                    {/*    className={styles.invite}*/}
                                    {/*    onClick={handleInvitationRace}*/}
                                    {/*    // disabled={!raceReadyToStart || !story.connected}*/}
                                    {/*>*/}
                                    {/*    INVITE*/}
                                    {/*</Button>*/}
                                    <Button
                                        variant="contained"
                                        color={raceReadyToStart ? 'success' : 'error'}
                                        className={styles.startStop}
                                        onClick={handleStartRace}
                                        // disabled={!story.connected}
                                    >
                                        {raceReadyToStart ? 'START' : 'STOP'}
                                    </Button>
                                </div>
                                {/*<TableLaps*/}
                                {/*    round={selectedRound}*/}
                                {/*    group={selectedGroup}*/}
                                {/*    raceStatus={story.raceStatus}*/}
                                {/*    groupLaps={story.laps}*/}
                                {/*    onChangePosition={handleOpenChangePositions}*/}
                                {/*/>*/}
                                <TableMXResults
                                    round={selectedRound}
                                    group={selectedGroup}
                                    raceStatus={story.raceStatus}
                                    groupLaps={story.laps}
                                    onChangePosition={handleOpenChangePositions}
                                />
                            </div>
                        )}
                    </Grid>
                </Grid>
            )}
            {(openDialogAddRound || openDialogEditRound) && (
                <DialogFormRound
                    open={openDialogAddRound || openDialogEditRound}
                    onClose={handleCloseDialog}
                    onSave={handleAddRound}
                    onUpdate={handleEditRound}
                    onDelete={handleDeleteRound}
                    rounds={rounds}
                    round={openDialogEditRound ? selectedRound : undefined}
                />
            )}
            {(openDialogAddGroup || openDialogEditGroup) && (
                <DialogFormGroup
                    open={openDialogAddGroup || !!openDialogEditGroup}
                    onClose={handleCloseDialog}
                    onSave={handleAddGroup}
                    onUpdate={handleEditGroup}
                    onDelete={handleDeleteGroup}
                    group={openDialogEditGroup}
                    groups={groups}
                    sportsmen={sportsmen}
                    teams={teams}
                    competition={story.competition!}
                />
            )}
            {openDialogChangePositions && (
                <DialogChangePositionsInGroup
                    open={!!openDialogChangePositions}
                    onClose={handleCloseDialog}
                    onUpdate={handleEditGroup}
                    group={openDialogChangePositions}
                />
            )}
        </div>
    );
});
