import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { observer } from 'mobx-react';
import { IGroup } from '@/types/IGroup';
import { TypeLap } from '@/types/TypeLap';
import { IRound } from '@/types/IRound';
import { ISportsman } from '@/types/ISportsman';
import { ILap } from '@/types/ILap';
import {
    Avatar,
    Badge,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List';
import ConstructionIcon from '@mui/icons-material/Construction';
import { sportsmanName } from '@/utils/sportsmanName';
import { story } from '@/story/story';
import { millisecondsToTimeString } from '@/utils/millisecondsToTimeString';
import { ListAllLaps } from '@/modules/rounds/components/ListAllLaps/ListAllLaps';
import {
    lapDeleteAction,
    lapInsertAction,
    lapUpdateAction,
    loadLapsForGroupAction,
    mxResultSetAction
} from '@/actions/actionLapRequest';
import { TypeRaceStatus } from '@/types/TypeRaceStatus';
import { matrixLapsWithPitStop } from '@/utils/matrixLapsWithPitStop';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TypeRace } from '@/types/TypeRace';
import { IMXResult } from '@/types/IMXResult';

import styles from './styles.module.scss';

interface ILapsProps {
    laps: number | undefined;
    duplicate: number | undefined;
    refresh_time: number | undefined;
    is_finished: boolean | undefined;
    onContextMenu: any;
}
interface ILapsState {
    color: string;
}
class LapsCell extends React.Component<ILapsProps, ILapsState> {
    timer: any;

    constructor(props: ILapsProps) {
        super(props);
        this.state = {
            color: 'white'
        };
    }

    componentDidMount() {
        // this.timer = setTimeout(() => {
        //     this.setState({ color: 'blue' });
        // }, 1000);
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    componentDidUpdate(prevProps: Readonly<ILapsProps>, prevState: Readonly<ILapsState>, snapshot?: any) {
        if (prevProps.laps !== this.props.laps) {
            this.setState({ color: 'blue' });

            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.setState({ color: 'white' });
            }, 500);
        } else if (prevProps.duplicate !== this.props.duplicate) {
            this.setState({ color: 'red' });

            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.setState({ color: 'white' });
            }, 250);
        }
    }

    render() {
        const style = {
            backgroundColor: this.state.color
        };
        return (
            <TableCell style={style} onContextMenu={this.props.onContextMenu}>
                {!!this.props.is_finished && <b>{this.props.laps}</b>}
                {!this.props.is_finished && this.props.laps}
            </TableCell>
        );
    }
}

interface IProps {
    round: IRound;
    group: IGroup;
    readonly?: boolean;
    raceStatus?: TypeRaceStatus;
    onChangePosition?: (id: string) => void;
    groupLaps?: ILap[];
}

export const TableMXResults: FC<IProps> = observer(
    ({ round, group, readonly, raceStatus, onChangePosition, groupLaps }: IProps) => {
        const refTableContainer = useRef<HTMLDivElement>(null);

        const membersGroup = useMemo(() => [...group.sportsmen, ...group.teams], [group.sportsmen, group.teams]);

        const [contextMenu, setContextMenu] = React.useState<
            | {
                  mouseX: number;
                  mouseY: number;
                  mxResult: IMXResult | undefined;
              }
            | undefined
        >(undefined);

        const handleContextMenu = useCallback(
            (mxResult: IMXResult | undefined) => (event: React.MouseEvent<HTMLLIElement>) => {
                event.preventDefault();
                setContextMenu(
                    contextMenu === undefined
                        ? {
                              mouseX: event.clientX - 2,
                              mouseY: event.clientY - 4,
                              mxResult: mxResult
                          }
                        : undefined
                );
            },
            [contextMenu]
        );

        const handleClose = useCallback(() => {
            // setOpenEdit(undefined);
            setContextMenu(undefined);
        }, []);

        const handleLapDown = useCallback(() => {
            let mxResults = story.mxResults;
            let mxResult = contextMenu?.mxResult;
            if (mxResults !== undefined && mxResult !== undefined && mxResults.get(mxResult.device) !== undefined) {
                let device = mxResults.get(mxResult.device);
                if (device != undefined && device.lap_down_count != undefined) {
                    device.lap_down_count += 1;
                }
                mxResults.set(mxResult.device, mxResult);
                mxResultSetAction(mxResult.device, mxResult.session, { ...mxResult });
            }
            // setOpenEdit(contextMenu?.mxResult);
            setContextMenu(undefined);
        }, [contextMenu?.mxResult]);

        const handlePlus5Sec = useCallback(() => {
            let mxResults = story.mxResults;
            let mxResult = contextMenu?.mxResult;
            if (mxResults != undefined && mxResult != undefined && mxResults.get(mxResult.device) != undefined) {
                let device = mxResults.get(mxResult.device);
                if (device != undefined && device.plus_5sec_count != undefined) {
                    device.plus_5sec_count += 1;
                }
                mxResults.set(mxResult.device, mxResult);
                mxResultSetAction(mxResult.device, mxResult.session, { ...mxResult });
            }

            // setOpenEdit(contextMenu?.mxResult);
            setContextMenu(undefined);
        }, [contextMenu?.mxResult]);

        const handleIsFinished = useCallback(() => {
            let mxResults = story.mxResults;
            let mxResult = contextMenu?.mxResult;
            if (mxResults != undefined && mxResult != undefined && mxResults.get(mxResult.device) != undefined) {
                let device = mxResults.get(mxResult.device);
                if (device != undefined && device.is_finished !== undefined) {
                    device.is_finished = !device.is_finished;
                }
                mxResults.set(mxResult.device, mxResult);
                mxResultSetAction(mxResult.device, mxResult.session, { ...mxResult });
            }

            // setOpenEdit(contextMenu?.mxResult);
            setContextMenu(undefined);
        }, [contextMenu?.mxResult]);

        function resultS(sportsman: ISportsman | undefined) {
            const _device: number = sportsman?.transponders[0] !== undefined ? sportsman?.transponders[0] : 0;
            return story?.mxResults?.get(+_device);
        }

        function speedF(speed: number | undefined) {
            let _speed = speed === undefined ? 0.0 : speed;

            _speed /= 100;

            return _speed.toFixed(2);
        }

        function millisToTime(time: number | undefined) {
            let _time = time === undefined ? 0.0 : time;

            if (_time < 0.001 || _time >= 1000000000) {
                return '00:00:00.000';
            } else {
                let _h = Math.trunc(_time / 1000 / 60 / 60);
                let h = '00';
                if (_h < 10) {
                    h = '0' + _h;
                } else {
                    h = '' + _h;
                }

                let _m = Math.trunc((_time - _h * 60 * 60 * 1000) / 60 / 1000);
                let m = '00';
                if (_m < 10) {
                    m = '0' + _m;
                } else {
                    m = '' + _m;
                }

                let _s = Math.trunc((_time - _h * 60 * 60 * 1000 - _m * 60 * 1000) / 1000);
                let s = '00';
                if (_s < 10) {
                    s = '0' + _s;
                } else {
                    s = '' + _s;
                }

                let _ms = _time % 1000;
                let ms = '000';
                if (_ms < 10) {
                    ms = '00' + _ms;
                } else if (_ms < 100) {
                    ms = '0' + _ms;
                } else {
                    ms = '' + _ms;
                }

                return `${h}:${m}:${s}.${ms}`;
            }
        }

        // 12413030 -> 12:41:30.300
        // function gpsToTime(time: number | undefined) {
        //     let _time = time == undefined ? 0.0 : time;
        //
        //     if (_time < 0.001 || _time >= 1000000000) {
        //         return '00:00:00.000';
        //     } else {
        //         let _h = Math.trunc(_time / 1000000);
        //         let h = '00';
        //         if (_h < 10) {
        //             h = '0' + _h;
        //         } else {
        //             h = '' + _h;
        //         }
        //
        //         let _m = Math.trunc((_time - _h * 1000000) / 10000);
        //         let m = '00';
        //         if (_m < 10) {
        //             m = '0' + _m;
        //         } else {
        //             m = '' + _m;
        //         }
        //
        //         let _s = Math.trunc((_time - _h * 1000000 - _m * 10000) / 100);
        //         let s = '00';
        //         if (_s < 10) {
        //             s = '0' + _s;
        //         } else {
        //             s = '' + _s;
        //         }
        //
        //         let _ms = _time % 100;
        //         let ms = '000';
        //         if (_ms < 10) {
        //             ms = '0' + _ms + '0';
        //         } else {
        //             ms = '' + _ms + '0';
        //         }
        //
        //         return `${h}:${m}:${s}.${ms}`;
        //     }
        // }

        return (
            <div>
                <TableContainer component={Paper} variant="outlined" className={styles.root} ref={refTableContainer}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Pilot</TableCell>
                                <TableCell>Laps</TableCell>
                                <TableCell>Max speed</TableCell>
                                <TableCell>Last lap</TableCell>
                                <TableCell>Best lap</TableCell>
                                <TableCell>Total time</TableCell>
                                <TableCell>Penalties</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {membersGroup
                                .sort((item1, item2) => {
                                    let result1 = resultS(item1?.sportsman);
                                    let result2 = resultS(item2?.sportsman);

                                    if (result1 === undefined) return 0;
                                    if (result2 === undefined) return 0;

                                    if (result1?.laps > result2?.laps) {
                                        return -1;
                                    } else if (result1?.laps < result2?.laps) {
                                        return 1;
                                    } else {
                                        if (result1?.total_time > result2?.total_time) {
                                            return 1;
                                        } else if (result1?.total_time < result2?.total_time) {
                                            return -1;
                                        }
                                    }
                                    return 0;
                                })
                                .map((item) => (
                                    <TableRow>
                                        <TableCell>{sportsmanName(item?.sportsman!)}</TableCell>
                                        <LapsCell
                                            laps={resultS(item?.sportsman)?.laps}
                                            refresh_time={resultS(item?.sportsman)?.refresh_time}
                                            duplicate={resultS(item?.sportsman)?.duplicate}
                                            is_finished={resultS(item?.sportsman)?.is_finished}
                                            onContextMenu={handleContextMenu(resultS(item?.sportsman))}
                                        />
                                        <TableCell>{speedF(resultS(item?.sportsman)?.max_speed)}</TableCell>
                                        <TableCell>{millisToTime(resultS(item?.sportsman)?.lap_time)}</TableCell>
                                        <TableCell>{millisToTime(resultS(item?.sportsman)?.best_time)}</TableCell>
                                        <TableCell>{millisToTime(resultS(item?.sportsman)?.total_time)}</TableCell>
                                        <TableCell>
                                            {resultS(item?.sportsman)?.lap_down_count}{' '}
                                            {resultS(item?.sportsman)?.plus_5sec_count}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Menu
                    open={contextMenu !== undefined}
                    onClose={handleClose}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        contextMenu !== undefined ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
                    }
                >
                    <MenuItem onClick={handleLapDown}>Lap down</MenuItem>
                    <MenuItem onClick={handlePlus5Sec}>+5 sec</MenuItem>
                    <MenuItem onClick={handleIsFinished}>Is finished</MenuItem>
                </Menu>
            </div>
        );
    }
);
