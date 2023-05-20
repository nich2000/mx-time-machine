import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { IGroup, IMembersGroup } from '@/types/IGroup';
import styles from '@/modules/rounds/components/ListGroups/styles.module.scss';
import {
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    MenuItem,
    Paper,
    Menu,
    Typography,
    createTheme
} from '@mui/material';
import Switch, { SwitchProps } from '@mui/material/Switch';
import cn from 'classnames';
import { styled } from '@mui/material/styles';
import { Tooltip } from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Error from '@mui/icons-material/Error';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import SdCardIcon from '@mui/icons-material/SdCard';
import BatteryAlert from '@mui/icons-material/BatteryAlert';
import Battery20 from '@mui/icons-material/Battery20';
import BatteryCharging20 from '@mui/icons-material/BatteryCharging20';
import Battery60 from '@mui/icons-material/Battery60';
import BatteryCharging60 from '@mui/icons-material/BatteryCharging60';
import Battery80 from '@mui/icons-material/Battery80';
import BatteryCharging80 from '@mui/icons-material/BatteryCharging80';
import BatteryChargingFull from '@mui/icons-material/BatteryChargingFull';
import BatteryFull from '@mui/icons-material/BatteryFull';
import SignalCellular0Bar from '@mui/icons-material/SignalCellular0Bar';
import SignalCellular1Bar from '@mui/icons-material/SignalCellular1Bar';
import SignalCellular2Bar from '@mui/icons-material/SignalCellular2Bar';
import SignalCellular3Bar from '@mui/icons-material/SignalCellular3Bar';
import SignalCellular4Bar from '@mui/icons-material/SignalCellular4Bar';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import StreamIcon from '@mui/icons-material/Stream';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { sportsmanName } from '@/utils/sportsmanName';
// import { ColorAndChannel } from '@/modules/rounds/components/ColorAndChannel/ColorAndChannel';
import { ICompetition } from '@/types/ICompetition';
import { DialogFormMembersGroup } from '@/modules/rounds/components/DialogFormMembersGroup/DialogFormMembersGroup';
import { Color } from '@/types/Color';
import { Channel } from '@/types/VTXChannel';
import { story } from '@/story/story';
import { observer } from 'mobx-react';
import { green, orange, red, yellow } from '@mui/material/colors';
import ReactHintFactory from 'react-hint';
import 'react-hint/css/index.css';
import Button1 from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ISportsman } from '@/types/ISportsman';
import { IMXDevice } from '@/types/IMXDevice';
import { Cancel } from '@mui/icons-material';

interface IProps {
    group: IGroup;
    selectedGroup?: IGroup;
    competition: ICompetition;
    isGroupInRace: boolean;
    onSelect: (id: string) => () => void;
    onEdit: (id: string) => () => void;
    onDelete: (id: string) => () => void;
    onUpdate: (id: string, group: IGroup) => void;
    onMXAction: (id: string, action: string, devices: any) => void;
}

export const TableGroup: FC<IProps> = observer(
    ({
        group,
        selectedGroup,
        competition,
        isGroupInRace,
        onSelect,
        onEdit,
        onDelete,
        onUpdate,
        onMXAction
    }: IProps) => {
        const ReactHint = ReactHintFactory(React);
        const draggedItem = useRef<string | undefined>(undefined);
        const [innerGroup, setInnerGroup] = useState(_.cloneDeep(group));
        const [contextMenu, setContextMenu] = React.useState<
            | {
                  mouseX: number;
                  mouseY: number;
                  membersGroup: IMembersGroup;
              }
            | undefined
        >(undefined);
        const [openEdit, setOpenEdit] = useState<IMembersGroup>();

        const [selectedSleep, setSelectedSleep] = useState<boolean | false>(false);
        // const [selectedSleep, setSelectedSleep] = useState<boolean | false>(
        //     window.localStorage.getItem('sleepToggle') === '1'
        // );

        const isSelected = (item: IGroup) => selectedGroup?._id === item._id;

        const handleContextMenu = useCallback(
            (membersGroup: IMembersGroup) => (event: React.MouseEvent<HTMLLIElement>) => {
                event.preventDefault();
                setContextMenu(
                    contextMenu === undefined
                        ? {
                              mouseX: event.clientX - 2,
                              mouseY: event.clientY - 4,
                              membersGroup
                          }
                        : undefined
                );
            },
            [contextMenu]
        );

        const handleClose = useCallback(() => {
            setOpenEdit(undefined);
            setContextMenu(undefined);
        }, []);

        const handleOpenEditDialog = useCallback(() => {
            setOpenEdit(contextMenu?.membersGroup);
            setContextMenu(undefined);
        }, [contextMenu?.membersGroup]);

        const handleUpdateMemberGroup = useCallback(
            (_id: string, color: Color, channel: Channel) => {
                onUpdate(innerGroup._id, {
                    ...innerGroup,
                    teams: innerGroup.teams.map((item) => {
                        if (item._id === _id) {
                            return {
                                ...item,
                                color,
                                channel
                            };
                        }
                        return item;
                    }),
                    sportsmen: innerGroup.sportsmen.map((item) => {
                        if (item._id === _id) {
                            return {
                                ...item,
                                color,
                                channel
                            };
                        }
                        return item;
                    })
                });
                handleClose();
            },
            [innerGroup, onUpdate, handleClose]
        );

        const onDragItemStart = useCallback(
            (id: string) => (e: React.DragEvent<HTMLLIElement>) => {
                draggedItem.current = id;
                e.dataTransfer.effectAllowed = 'move';
            },
            []
        );

        const onDragItemOver = useCallback(
            (id: string) => (e: React.DragEvent<HTMLLIElement>) => {
                e.preventDefault();
                const isSportsmen = innerGroup?.sportsmen?.length > 0;
                const items = isSportsmen ? innerGroup.sportsmen : innerGroup.teams;
                const index = _.findIndex(items, (item: IMembersGroup) => item._id === id);
                if (!draggedItem.current || draggedItem.current === items[index]._id) {
                    return;
                }
                const oldIndex = _.findIndex(items, (item: IMembersGroup) => item._id === draggedItem.current);
                [items[index], items[oldIndex]] = [items[oldIndex], items[index]];
                const sortedItems = items.map((item: IMembersGroup, indx: number) => {
                    const startNumber = indx + 1;
                    const colorAndChannel = window.api.competitionColorAndChannel(
                        startNumber,
                        _.cloneDeep(competition)
                    );
                    return {
                        ...item,
                        startNumber,
                        color: colorAndChannel?.color,
                        channel: colorAndChannel?.channel
                    };
                });
                setInnerGroup({
                    ...innerGroup,
                    teams: isSportsmen ? innerGroup.teams : sortedItems,
                    sportsmen: isSportsmen ? sortedItems : innerGroup.sportsmen
                });
            },
            [competition, innerGroup]
        );

        const onDragItemEnd = useCallback(() => {
            draggedItem.current = undefined;
            onUpdate(innerGroup._id, innerGroup);
        }, [innerGroup, onUpdate]);

        const [dateTime, setDateTime] = useState('');
        useEffect(() => {
            setInnerGroup(_.cloneDeep(group));

            const interval = setInterval(() => {
                let _currentDate = new Date();
                let _dateTime =
                    'Last Sync: ' +
                    _currentDate.getDate() +
                    '.' +
                    (_currentDate.getMonth() + 1) +
                    '.' +
                    _currentDate.getFullYear() +
                    ' ' +
                    _currentDate.getHours() +
                    ':' +
                    _currentDate.getMinutes() +
                    ':' +
                    _currentDate.getSeconds();
                setDateTime(_dateTime);
                // console.log(dateTime);

                let l = [...(innerGroup.sportsmen || []), ...(innerGroup.teams || [])];
                for (let i = 0; i < l.length; i++) {
                    const item = l[i];
                    const sportsman = item.sportsman;
                    const _device: number = sportsman?.transponders[0] !== undefined ? sportsman?.transponders[0] : 0;
                    const device = story?.mxDevices?.get(+_device);
                    // console.log(device);

                    if (device !== undefined) {
                        const sec = innerGroup.sportsmen.length / 2 + 2;
                        const startDate = device.pingTime;
                        const endDate = Date.now();
                        const seconds = (endDate - startDate) / 1000;
                        // console.log(seconds);

                        if (seconds > sec * 2) {
                            device.connected = 0;
                        } else if (seconds > sec) {
                            device.connected = 1;
                        } else {
                            device.connected = 2;
                        }
                    }
                }
            }, 1000);
            return () => clearInterval(interval);
        }, [group, dateTime]);

        function checkStatus(param: number, sportsman: ISportsman | undefined, status?: number) {
            const _status: number = status !== undefined ? status : 0;

            switch (param) {
                // -1 check all statuses for error
                case -1: {
                    const _device: number = sportsman?.transponders[0] !== undefined ? sportsman?.transponders[0] : 0;
                    const device = story?.mxDevices?.get(+_device);

                    if (device !== undefined) {
                        if (device.connected === 0) {
                            return <Cancel sx={{ color: red[500] }} />;
                        } else if (device.connected === 1) {
                            if ((_status & (7 << 0)) !== 0) {
                                return <CheckCircle sx={{ color: orange[500] }} />;
                            } else {
                                return <Error sx={{ color: orange[500] }} />;
                            }
                        } else {
                            if ((_status & (7 << 0)) !== 0) {
                                return <CheckCircle sx={{ color: green[500] }} />;
                            } else {
                                return <Error sx={{ color: green[500] }} />;
                            }
                        }
                    } else {
                        // return <Error sx={{ color: red[500] }} />;
                        return <Cancel sx={{ color: red[500] }} />;
                    }
                    // break;
                }
                // 0 GPS status          ok/not ok
                case 0: {
                    if ((_status & (1 << 0)) !== 0) {
                        return <GpsFixedIcon color="action" />;
                    } else {
                        return <GpsNotFixedIcon color="action" />;
                    }
                    // break;
                }
                // 1 Gyro status         ok/not ok
                case 1: {
                    if ((_status & (1 << 1)) !== 0) {
                        return <CheckIcon color="action" />;
                    } else {
                        return <ClearIcon color="action" />;
                    }
                    // break;
                }
                // 2 Accel status        ok/not ok
                case 2: {
                    if ((_status & (1 << 2)) !== 0) {
                        return <CheckIcon color="action" />;
                    } else {
                        return <ClearIcon color="action" />;
                    }
                    // break;
                }
                // 3 Flash status        ok/not ok
                case 3: {
                    if ((_status & (1 << 3)) !== 0) {
                        return <SdCardIcon color="action" />;
                    } else {
                        return <SdCardIcon sx={{ color: red[500] }} />;
                    }
                    // break;
                }
                // 4 Power status1       full 100%  medium 75%
                // 5 Power status2       low 50%    critical 25%
                case 4: {
                    if ((_status & (1 << 4)) !== 0) {
                        if ((_status & (1 << 5)) !== 0) {
                            return <BatteryFull color="action" />;
                        } else {
                            return <Battery60 color="action" />;
                        }
                    } else {
                        if ((_status & (1 << 5)) !== 0) {
                            return <Battery20 color="action" />;
                        } else {
                            return <BatteryAlert sx={{ color: red[500] }} />;
                        }
                    }
                    // break;
                }
                default: {
                    break;
                }
            }
        }

        function checkBattery(battery?: number) {
            let _battery: number = battery !== undefined ? battery : 0;

            const isCharging = _battery > 128;

            if (isCharging) {
                _battery = _battery - 128;
            }

            // 0
            // 32
            // 64
            // 96
            if (_battery > 96) {
                if (isCharging) return <BatteryChargingFull color="action" />;
                else return <BatteryFull color="action" />;
            } else if (_battery > 64) {
                if (isCharging) return <BatteryCharging80 color="action" />;
                else return <Battery80 color="action" />;
            } else if (_battery > 32) {
                if (isCharging) return <BatteryCharging60 color="action" />;
                else return <Battery60 color="action" />;
            } else if (_battery > 0) {
                if (isCharging) return <BatteryCharging20 sx={{ color: orange[500] }} />;
                else return <Battery20 sx={{ color: orange[500] }} />;
            } else {
                return <BatteryAlert sx={{ color: red[500] }} />;
            }
        }

        function checkRSSI(rssi?: number) {
            const _rssi: number = rssi !== undefined ? rssi : 255;

            if (_rssi < 50) {
                return (
                    <span>
                        <SignalCellular4Bar color="action" />
                        <b style={{ fontSize: 13 }}>{_rssi}</b>
                    </span>
                );
            } else if (_rssi < 70) {
                return (
                    <span>
                        <SignalCellular3Bar color="action" />
                        <b style={{ fontSize: 13 }}>{_rssi}</b>
                    </span>
                );
            } else if (_rssi < 80) {
                return (
                    <span>
                        <SignalCellular2Bar color="action" />
                        <b style={{ fontSize: 13 }}>{_rssi}</b>
                    </span>
                );
            } else if (_rssi < 90) {
                return (
                    <span>
                        <SignalCellular1Bar sx={{ color: orange[500] }} />
                        <b style={{ fontSize: 13 }}>{_rssi}</b>
                    </span>
                );
            } else {
                return (
                    <span>
                        <SignalCellular0Bar sx={{ color: red[500] }} />
                        <b style={{ fontSize: 13 }}>{_rssi}</b>
                    </span>
                );
            }
        }

        // function MXActionButton(id: string, action: string, ComponentOn: any, ComponentOff: any) {
        //     const [open, setOpen] = React.useState(false);
        //
        //     const handleClickOpen = () => {
        //         setOpen(true);
        //     };
        //
        //     const handleDisagree = () => {
        //         setOpen(false);
        //     };
        //
        //     const handleAgree = () => {
        //         setOpen(false);
        //
        //         let devices = [];
        //         for (let i = 0; i < group.sportsmen.length; i++) {
        //             if (group.sportsmen[i] !== undefined) {
        //                 if (group.sportsmen[i].sportsman !== undefined) {
        //                     if (group.sportsmen[i].sportsman?.transponders[0] !== undefined) {
        //                         let id = group.sportsmen[i].sportsman?.transponders[0];
        //                         devices.push(id);
        //                     }
        //                 }
        //             }
        //         }
        //
        //         onMXAction(id, action, devices);
        //
        //         if (selectedSleep) setSelectedSleep(false);
        //         else setSelectedSleep(true);
        //         // if (selectedSleep) window.localStorage.setSetItem('sleepToggle', '1');
        //         // else window.localStorage.setSetItem('sleepToggle', '0');
        //     };
        //
        //     function handleClose() {
        //         setOpen(false);
        //     }
        //
        //     function selectSleep(value: boolean) {
        //         if (value) return <ComponentOn />;
        //         else return <ComponentOff />;
        //     }
        //
        //     return (
        //         <b>
        //             <IconButton data-rh={action} onClick={handleClickOpen}>
        //                 {selectSleep(selectedSleep)}
        //             </IconButton>
        //
        //             <Dialog
        //                 open={open}
        //                 onClose={handleClose}
        //                 aria-labelledby="alert-dialog-title"
        //                 aria-describedby="alert-dialog-description"
        //             >
        //                 <DialogTitle id="alert-dialog-title">{`Send command "${action}" to device group?`}</DialogTitle>
        //                 <DialogActions>
        //                     <Button1 onClick={handleDisagree}>NO</Button1>
        //                     <Button1 onClick={handleAgree} autoFocus>
        //                         YES
        //                     </Button1>
        //                 </DialogActions>
        //             </Dialog>
        //         </b>
        //     );
        // }

        function transponder(sportsman: ISportsman | undefined) {
            return sportsman?.transponders[0] !== undefined ? sportsman?.transponders[0] : 0;
        }

        function deviceS(sportsman: ISportsman | undefined) {
            const _device: number = sportsman?.transponders[0] !== undefined ? sportsman?.transponders[0] : 0;
            // console.log(_device);
            const device = story?.mxDevices?.get(+_device);
            // console.log(device);
            return device;
        }

        // function deviceColor(sportsman: ISportsman | undefined) {
        //     const _device: number = sportsman?.transponders[0] !== undefined ? sportsman?.transponders[0] : 0;
        //     const device = story?.mxDevices?.get(+_device);
        //
        //     if (device !== undefined) {
        //         const sec = innerGroup.sportsmen.length / 2 + 2;
        //         const startDate = device.pingTime;
        //         const endDate = Date.now();
        //         const seconds = (endDate - startDate) / 1000;
        //         if (seconds > sec * 2) {
        //             return 'red';
        //         } else if (seconds > sec) {
        //             return 'orange';
        //         } else {
        //             return 'green';
        //         }
        //     }
        //     return 'black';
        // }

        // function device(index: number) {
        //     return story?.mxDevices?.get(index);
        // }

        // const theme = createTheme({
        //     components: {
        //         MuiSwitch: {
        //             styleOverrides: {
        //                 switchBase: {
        //                     //thumb - unchecked
        //                     color: 'orange'
        //                 },
        //                 colorPrimary: {
        //                     '&.Mui-checked': {
        //                         // thumb - checked
        //                         color: 'red'
        //                     }
        //                 },
        //                 track: {
        //                     // track - unchecked
        //                     opacity: 0.2,
        //                     backgroundColor: 'blue',
        //                     '.Mui-checked.Mui-checked + &': {
        //                         // track - checked
        //                         opacity: 0.9,
        //                         backgroundColor: 'pink'
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // });

        const MaterialUISwitch = styled(Switch)(({ theme }) => ({
            width: 62,
            height: 34,
            padding: 7,
            '& .MuiSwitch-switchBase': {
                margin: 1,
                padding: 0,
                transform: 'translateX(6px)',
                '&.Mui-checked': {
                    color: '#fff',
                    transform: 'translateX(22px)',
                    '& .MuiSwitch-thumb:before': {
                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                            '#fff'
                        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`
                    },
                    '& + .MuiSwitch-track': {
                        opacity: 0.5,
                        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be'
                    }
                }
            },
            '& .MuiSwitch-thumb': {
                backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
                width: 32,
                height: 32,
                '&:before': {
                    content: "''",
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    left: 0,
                    top: 0,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                        '#fff'
                    )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`
                }
            },
            '& .MuiSwitch-track': {
                opacity: 0.5,
                backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
                borderRadius: 20 / 2
            }
        }));

        function handleChange(id: string) {
            if (selectedSleep) {
                setSelectedSleep(false);
            } else {
                let devices = [];
                for (let i = 0; i < group.sportsmen.length; i++) {
                    if (group.sportsmen[i] !== undefined) {
                        if (group.sportsmen[i].sportsman !== undefined) {
                            if (group.sportsmen[i].sportsman?.transponders[0] !== undefined) {
                                let id = group.sportsmen[i].sportsman?.transponders[0];
                                devices.push(id);
                            }
                        }
                    }
                }
                onMXAction(id, 'sleep', devices);

                setSelectedSleep(true);
            }
        }

        return (
            <Paper key={innerGroup._id} elevation={isSelected(innerGroup) ? 5 : 1} className={styles.paper}>
                {/*<span>{dateTime}</span>*/}
                <List
                    dense
                    onClick={onSelect(innerGroup._id)}
                    className={cn(styles.group, { [styles.groupInRace]: isGroupInRace })}
                    component="nav"
                    subheader={
                        <ListSubheader
                            disableSticky
                            component="div"
                            className={cn(styles.headerGroup, { [styles.selected]: isSelected(innerGroup) })}
                        >
                            <Tooltip title="Sleep group">
                                <MaterialUISwitch
                                    sx={{ m: 1 }}
                                    checked={selectedSleep}
                                    onChange={() => handleChange(innerGroup._id)}
                                />
                            </Tooltip>
                            {innerGroup.name}
                            {/*<ReactHint autoPosition events />*/}
                            <div className={styles.actionsGroup}>
                                {/*<Tooltip title="Send device ready to base">*/}
                                {/*    {MXActionButton(innerGroup._id, 'ready', StreamIcon)}*/}
                                {/*</Tooltip>*/}
                                <Tooltip title="Edit group">
                                    <IconButton data-rh="edit" onClick={onEdit(innerGroup._id)}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                {/*<Tooltip title="Sleep group">*/}
                                {/*    {MXActionButton(innerGroup._id, 'sleep', BedtimeIcon, StreamIcon)}*/}
                                {/*</Tooltip>*/}
                                <Tooltip title="Delete group">
                                    <IconButton data-rh="delete" onClick={onDelete(innerGroup._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </ListSubheader>
                    }
                >
                    {[...(innerGroup.sportsmen || []), ...(innerGroup.teams || [])].map((item) => (
                        <ListItem
                            key={item._id}
                            divider
                            draggable="true"
                            selected={isSelected(innerGroup)}
                            // containerStyle={{backgroundColor: '#3d3c3a'}}
                            onDragStart={onDragItemStart(item._id)}
                            onDragOver={onDragItemOver(item._id)}
                            onDragEnd={onDragItemEnd}
                            onContextMenu={handleContextMenu(item)}
                        >
                            {/* max-width - не работает */}
                            <ListItemText primary={<Typography max-width={'10px'}>{item.startNumber}</Typography>} />
                            <ListItemText
                                primary={
                                    <Typography textAlign={'left'}>
                                        {item.team?.name || sportsmanName(item?.sportsman!)}
                                    </Typography>
                                }
                            />
                            <ListItemText primary={transponder(item.sportsman)} />
                            {checkStatus(-1, item.sportsman, deviceS(item.sportsman)?.status)}
                            {checkStatus(0, item.sportsman, deviceS(item.sportsman)?.status)}
                            {/*{checkStatus(1, deviceS(item.sportsman)?.status)}*/}
                            {/*{checkStatus(2, deviceS(item.sportsman)?.status)}*/}
                            {/*{checkStatus(3, deviceS(item.sportsman)?.status)}*/}
                            {/*{checkStatus(4, item.sportsman, deviceS(item.sportsman)?.status)}*/}
                            {checkBattery(deviceS(item.sportsman)?.battery)}
                            {checkRSSI(deviceS(item.sportsman)?.rssi)}
                            {/*{item.channel !== undefined && item.color !== undefined && (*/}
                            {/*    <ColorAndChannel channel={item.channel} color={item.color} />*/}
                            {/*)}*/}
                        </ListItem>
                    ))}
                </List>
                <Menu
                    open={contextMenu !== undefined}
                    onClose={handleClose}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        contextMenu !== undefined ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
                    }
                >
                    <MenuItem onClick={handleOpenEditDialog}>Edit</MenuItem>
                </Menu>
                {!!openEdit && (
                    <DialogFormMembersGroup
                        open={!!openEdit}
                        membersGroup={openEdit}
                        onClose={handleClose}
                        onUpdate={handleUpdateMemberGroup}
                    />
                )}
            </Paper>
        );
    }
);
