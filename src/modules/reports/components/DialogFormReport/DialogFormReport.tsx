import React, { FC, useCallback, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from '@mui/material';
import { IReport } from '@/types/IReport';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { TypeReport } from '@/types/TypeReport';
import _ from 'lodash';
import { TypeRoundReport } from '@/types/TypeRoundReport';
import { IRound } from '@/types/IRound';
import { dateTimeStr } from '@/utils/dateTimeUtils';
import { loadCompetitionAction, loadMXSessionAction } from '@/actions/actionReportRequest';
import { IMXSession } from '@/types/IMXSession';
import { ICompetition } from '@/types/ICompetition';
import { story } from '@/story/story';

interface IProps {
    open: boolean;
    onClose: () => void;
    onSave: (report: Omit<IReport, '_id' | 'competitionId'>) => void;
    onUpdate: (_id: string, report: Omit<IReport, '_id' | 'competitionId'>) => void;
    onDelete: (_id: string) => void;
    report?: IReport;
    rounds?: IRound[];
}

export const DialogFormReport: FC<IProps> = ({ open, onClose, onSave, onUpdate, onDelete, report, rounds }: IProps) => {
    const [name, setName] = useState(report?.name || dateTimeStr());
    const [type, setType] = useState(report?.type || TypeReport.MX_RESULTS);
    const [sessionId, setSessionId] = useState(report?.sessionId || '');
    const [competitionId, setCompetitionId] = useState(report?.competitionId || '');
    const [typeRound, setTypeRound] = useState(report?.typeRound || TypeRoundReport.PRACTICE);
    const [notCountedRounds, setNotCountedRounds] = useState(report?.notCountedRounds || 1);
    const [onlySportsmen, setOnlySportsmen] = useState(report?.onlySportsmen || false);
    const [simplified, setSimplified] = useState(report?.simplified || false);
    const [broadCastStyle, setBroadCastStyle] = useState(report?.broadCastStyle || false);
    const [count, setCount] = useState(report?.count || 0);
    const [roundId, setRoundId] = useState(report?.roundId);

    const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }, []);
    const handleChangeType = useCallback((event: SelectChangeEvent<TypeReport>) => {
        setType(event.target.value as TypeReport);
    }, []);
    const handleChangeSessionId = useCallback((event: SelectChangeEvent) => {
        setSessionId(event.target.value);
        setName(event.target.value);
    }, []);
    const handleChangeCompetitionId = useCallback((event: SelectChangeEvent) => {
        setCompetitionId(event.target.value);
    }, []);
    // const handleChangeTypeRound = useCallback((event: SelectChangeEvent<TypeRoundReport>) => {
    //     setTypeRound(event.target.value as TypeRoundReport);
    // }, []);
    // const handleChangeNotCountedRounds = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    //     setNotCountedRounds(Number(event.target.value));
    // }, []);
    // const handleChangeOnlySportsmen = useCallback((_event: React.ChangeEvent<HTMLInputElement>) => {
    //     setOnlySportsmen((prev) => !prev);
    // }, []);
    // const handleChangeSimplified = useCallback((_event: React.ChangeEvent<HTMLInputElement>) => {
    //     setSimplified((prev) => !prev);
    // }, []);
    // const handleChangeBroadCastStyle = useCallback((_event: React.ChangeEvent<HTMLInputElement>) => {
    //     setBroadCastStyle((prev) => !prev);
    // }, []);
    // const handleChangeCount = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    //     setCount(Number(event.target.value));
    // }, []);
    // const handleChangeRoundId = useCallback((event: SelectChangeEvent) => {
    //     setRoundId(event.target.value as TypeReport);
    // }, []);

    // function getCompetition(): ICompetition | undefined {
    //     for (let i = 0; i < competitions.length; i++) {
    //         if (competitions[i]._id === competitionId) {
    //             return competitions[i];
    //         }
    //     }
    //     return undefined;
    // }

    const handleSave = useCallback(() => {
        // let competition = getCompetition();

        const newReport = {
            competitionId,
            roundId,
            name,
            type,
            sessionId,
            typeRound,
            notCountedRounds,
            onlySportsmen,
            simplified,
            count,
            broadCastStyle
            // competition_name: competition?.name || '',
            // competition_description: competition?.description || '',
            // official1_title: competition?.official1_title || '',
            // official1_name: competition?.official1_name || '',
            // official2_title: competition?.official2_title || '',
            // official2_name: competition?.official2_name || '',
            // official3_title: competition?.official3_title || '',
            // official3_name: competition?.official3_name || ''
        };
        if (report?._id) {
            onUpdate(report?._id, _.cloneDeep(newReport));
        } else {
            onSave(newReport);
        }
    }, [
        count,
        name,
        type,
        typeRound,
        notCountedRounds,
        onlySportsmen,
        simplified,
        broadCastStyle,
        report?._id,
        roundId,
        onUpdate,
        onSave
    ]);

    const handleDelete = useCallback(() => {
        if (report) {
            onDelete(report._id);
        }
    }, [onDelete, report]);

    const [sessions, setSessions] = useState<Array<IMXSession>>([]);

    const [competitions, setCompetitions] = useState<Array<ICompetition>>([]);

    useEffect(() => {
        loadMXSessionAction(story.competition?._id).then(setSessions);

        loadCompetitionAction().then(setCompetitions);
    }, []);

    const __ = ' ';

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{report ? 'Edit' : 'New'} report</DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    sx={{
                        '& > :not(style)': { m: 1 }
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <TextField fullWidth label="Name" error={!name} value={name} onChange={handleChangeName} />
                    <FormControl fullWidth>
                        <InputLabel id="type-label">Type</InputLabel>
                        <Select labelId="type-label" value={type} label="Type" onChange={handleChangeType}>
                            <MenuItem key={'MX_RESULTS'} value={'MX_RESULTS'}>
                                {'MX_RESULTS'}
                            </MenuItem>
                            <MenuItem key={'MX_LAPS'} value={'MX_LAPS'}>
                                {'MX_LAPS'}
                            </MenuItem>
                        </Select>
                    </FormControl>

                    {/*<FormControl fullWidth>*/}
                    {/*    <InputLabel id="competition-label">Competition</InputLabel>*/}
                    {/*    <Select*/}
                    {/*        labelId="competition-label"*/}
                    {/*        value={competitionId}*/}
                    {/*        label="Competition"*/}
                    {/*        onChange={handleChangeCompetitionId}*/}
                    {/*    >*/}
                    {/*        {competitions.map((item) => (*/}
                    {/*            <MenuItem value={item._id}>{item.name}</MenuItem>*/}
                    {/*        ))}*/}
                    {/*    </Select>*/}
                    {/*</FormControl>*/}

                    <FormControl fullWidth>
                        <InputLabel id="session-label">Session</InputLabel>
                        <Select
                            labelId="session-label"
                            value={sessionId}
                            label="Session"
                            onChange={handleChangeSessionId}
                        >
                            {sessions.map((item) => (
                                <MenuItem value={item.sessionId}>
                                    {item.sessionId}
                                    {__}
                                    {item.competitionName}
                                    {__}
                                    {item.roundName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/*{[TypeReport.BEST_LAP, TypeReport.BEST_PIT_STOP, TypeReport.COUNT_LAPS].includes(type) && (*/}
                    {/*    <FormControl fullWidth>*/}
                    {/*        <InputLabel id="type-round-label">Type round</InputLabel>*/}
                    {/*        <Select<TypeRoundReport>*/}
                    {/*            labelId="type-round-label"*/}
                    {/*            value={typeRound}*/}
                    {/*            label="Type round"*/}
                    {/*            onChange={handleChangeTypeRound}*/}
                    {/*        >*/}
                    {/*            {Object.keys(TypeRoundReport).map((key) => (*/}
                    {/*                <MenuItem key={key} value={key}>*/}
                    {/*                    {key}*/}
                    {/*                </MenuItem>*/}
                    {/*            ))}*/}
                    {/*        </Select>*/}
                    {/*    </FormControl>*/}
                    {/*)}*/}
                    {/*{[TypeReport.ROUND_GROUPS, TypeReport.ROUND_GROUPS_LAPS].includes(type) && (*/}
                    {/*    <FormControl fullWidth>*/}
                    {/*        <InputLabel id="round-label">Round</InputLabel>*/}
                    {/*        <Select labelId="round-label" value={roundId} label="Round" onChange={handleChangeRoundId}>*/}
                    {/*            {(rounds || []).map((round) => (*/}
                    {/*                <MenuItem key={round._id} value={round._id}>*/}
                    {/*                    {round.name}*/}
                    {/*                </MenuItem>*/}
                    {/*            ))}*/}
                    {/*        </Select>*/}
                    {/*    </FormControl>*/}
                    {/*)}*/}
                    {/*{type === TypeReport.BEST_LAP && (*/}
                    {/*    <FormControlLabel*/}
                    {/*        control={<Switch checked={onlySportsmen} onChange={handleChangeOnlySportsmen} />}*/}
                    {/*        label="Only sportsmen"*/}
                    {/*    />*/}
                    {/*)}*/}
                    {/*<FormControlLabel*/}
                    {/*    control={<Switch checked={simplified} onChange={handleChangeSimplified} />}*/}
                    {/*    label="Simplified"*/}
                    {/*/>*/}
                    {/*<FormControlLabel*/}
                    {/*    control={<Switch checked={broadCastStyle} onChange={handleChangeBroadCastStyle} />}*/}
                    {/*    label="Broadсast style"*/}
                    {/*/>*/}
                    {/*{type === TypeReport.COUNT_LAPS && (*/}
                    {/*    <TextField*/}
                    {/*        fullWidth*/}
                    {/*        label="Number of failed rounds not counted"*/}
                    {/*        type="number"*/}
                    {/*        value={notCountedRounds}*/}
                    {/*        onChange={handleChangeNotCountedRounds}*/}
                    {/*    />*/}
                    {/*)}*/}
                    {/*<TextField*/}
                    {/*    fullWidth*/}
                    {/*    label="Top positions in the report"*/}
                    {/*    type="number"*/}
                    {/*    value={count}*/}
                    {/*    onChange={handleChangeCount}*/}
                    {/*    helperText="0 = no limit"*/}
                    {/*/>*/}
                </Box>
            </DialogContent>
            <DialogActions>
                {!!report && (
                    <Button onClick={handleDelete} style={{ marginRight: 'auto' }} color="error">
                        Delete
                    </Button>
                )}
                <Button onClick={onClose}>Close</Button>
                <Button onClick={handleSave} disabled={!name}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};
