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
import { lapDeleteAction, lapInsertAction, lapUpdateAction, loadLapsForGroupAction } from '@/actions/actionLapRequest';
import { TypeRaceStatus } from '@/types/TypeRaceStatus';
import { matrixLapsWithPitStop } from '@/utils/matrixLapsWithPitStop';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TypeRace } from '@/types/TypeRace';

import styles from './styles.module.scss';

interface IProps {
    round: IRound;
    group: IGroup;
    readonly?: boolean;
    raceStatus?: TypeRaceStatus;
    onChangePosition?: (id: string) => void;
    groupLaps?: ILap[];
}

export const TableResults: FC<IProps> = observer(
    ({ round, group, readonly, raceStatus, onChangePosition, groupLaps }: IProps) => {
        const refTableContainer = useRef<HTMLDivElement>(null);

        const membersGroup = useMemo(() => [...group.sportsmen, ...group.teams], [group.sportsmen, group.teams]);

        function resultS(sportsman: ISportsman | undefined) {
            const _device: number = sportsman?.transponders[0] !== undefined ? sportsman?.transponders[0] : 0;
            // console.log(_device);
            const result = story?.mxResults?.get(+_device);
            // console.log(result);
            return result;
        }

        function speedF(speed: number | undefined) {
            let _speed = speed == undefined ? 0.0 : speed;

            _speed /= 100;

            return _speed.toFixed(2);
        }

        function timeF(time: number | undefined) {
            let _time = time == undefined ? 0.0 : time;

            if (_time < 0.001) {
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

        return (
            <TableContainer component={Paper} variant="outlined" className={styles.root} ref={refTableContainer}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Pilot</TableCell>
                            <TableCell>Laps</TableCell>
                            <TableCell>Max speed</TableCell>
                            <TableCell>Best lap</TableCell>
                            <TableCell>Total time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {membersGroup.map((item) => (
                            <TableRow>
                                <TableCell>{sportsmanName(item?.sportsman!)}</TableCell>
                                <TableCell>{resultS(item?.sportsman)?.laps}</TableCell>
                                <TableCell>{speedF(resultS(item?.sportsman)?.best_speed)}</TableCell>
                                <TableCell>{timeF(resultS(item?.sportsman)?.best_time)}</TableCell>
                                <TableCell>{timeF(resultS(item?.sportsman)?.total_time)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }
);
