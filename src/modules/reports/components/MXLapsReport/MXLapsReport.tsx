import { IReport } from '@/types/IReport';
import { observer } from 'mobx-react';
import { FC, useEffect, useRef, useState } from 'react';
import { IMXLap } from '@/types/IMXLap';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { loadMXLapsAction } from '@/actions/actionReportRequest';
import { story } from '@/story/story';

interface IProps {
    report: IReport;
}

export const MXLapsReport: FC<IProps> = observer(({ report }) => {
    const refTableContainer = useRef<HTMLDivElement>(null);

    const [rows, setRows] = useState<Array<IMXLap>>([]);

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

    function pilotByDevice(device: number | undefined) {
        const sportsmen = story.sportsmen;
        for (let i = 0; i < sportsmen.length; i++) {
            const pilot = sportsmen[i];
            const _device: number = pilot?.transponders[0] !== undefined ? pilot?.transponders[0] : 0;

            if (_device == device) {
                return sportsmen[i].lastName;
            }
        }
        return device;
    }

    useEffect(() => {
        loadMXLapsAction(report.sessionId).then(setRows);
    });

    return (
        <TableContainer component={Paper} variant="outlined" ref={refTableContainer}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        {/*<TableCell>Position</TableCell>*/}
                        <TableCell>Pilot</TableCell>
                        {/*<TableCell>Device</TableCell>*/}
                        <TableCell>Lap</TableCell>
                        <TableCell>Max speed</TableCell>
                        <TableCell>Lap time</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((item, index) => (
                        <TableRow>
                            {/*<TableCell>{index + 1}</TableCell>*/}
                            <TableCell>{pilotByDevice(item?.device)}</TableCell>
                            {/*<TableCell>{item?.device}</TableCell>*/}
                            <TableCell>{item?.num}</TableCell>
                            <TableCell>{speedF(item?.max_speed)}</TableCell>
                            <TableCell>{millisToTime(item?.lap_time)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
});
