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
    Typography
} from '@mui/material';
import cn from 'classnames';
// import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
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
import Battery60 from '@mui/icons-material/Battery60';
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
import { red } from '@mui/material/colors';
import { green } from '@mui/material/colors';
import ReactHintFactory from 'react-hint';
import 'react-hint/css/index.css';
import Button1 from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { ISportsman } from '@/types/ISportsman';

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

        useEffect(() => {
            setInnerGroup(_.cloneDeep(group));
        }, [group]);

        function checkStatus(param: number, status?: number) {
            const _status: number = status !== undefined ? status : 0;

            switch (param) {
                // -1 check all statuses for error
                case -1: {
                    if ((_status & (7 << 0)) !== 0) {
                        return <CheckCircle sx={{ color: green[500] }} />;
                    } else {
                        return <Error sx={{ color: red[500] }} />;
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

        function checkRSSI(rssi?: number) {
            const _rssi: number = rssi !== undefined ? rssi : 255;

            if (_rssi < 70) {
                return (
                    <span>
                        <SignalCellular4Bar color="action" />
                        {_rssi}
                    </span>
                );
            } else if (_rssi < 100) {
                return (
                    <span>
                        <SignalCellular3Bar color="action" />
                        {_rssi}
                    </span>
                );
            } else if (_rssi < 130) {
                return (
                    <span>
                        <SignalCellular2Bar color="action" />
                        {_rssi}
                    </span>
                );
            } else if (_rssi < 160) {
                return (
                    <span>
                        <SignalCellular1Bar color="action" />
                        {_rssi}
                    </span>
                );
            } else {
                return (
                    <span>
                        <SignalCellular0Bar sx={{ color: red[500] }} />
                        {_rssi}
                    </span>
                );
            }
        }

        function MXActionButton(id: string, action: string, Component: any) {
            const [open, setOpen] = React.useState(false);

            const handleClickOpen = () => {
                setOpen(true);
            };

            const handleDisagree = () => {
                setOpen(false);
            };

            const handleAgree = () => {
                setOpen(false);

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

                onMXAction(id, action, devices);
            };

            function handleClose() {
                setOpen(false);
            }

            return (
                <b>
                    <IconButton data-rh={action} onClick={handleClickOpen}>
                        <Component />
                    </IconButton>

                    <Dialog
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{`Send command "${action}" to device group?`}</DialogTitle>
                        <DialogActions>
                            <Button1 onClick={handleDisagree}>NO</Button1>
                            <Button1 onClick={handleAgree} autoFocus>
                                YES
                            </Button1>
                        </DialogActions>
                    </Dialog>
                </b>
            );
        }

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

        // function device(index: number) {
        //     return story?.mxDevices?.get(index);
        // }

        return (
            <Paper key={innerGroup._id} elevation={isSelected(innerGroup) ? 5 : 1} className={styles.paper}>
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
                            {innerGroup.name}
                            {/*<ReactHint autoPosition events />*/}
                            <div className={styles.actionsGroup}>
                                {/*<Tooltip title="Send device sleep to base">*/}
                                {/*    {MXActionButton(innerGroup._id, 'sleep', BedtimeIcon)}*/}
                                {/*</Tooltip>*/}
                                {/*<Tooltip title="Send device ready to base">*/}
                                {/*    {MXActionButton(innerGroup._id, 'ready', StreamIcon)}*/}
                                {/*</Tooltip>*/}
                                <Tooltip title="Edit group">
                                    <IconButton data-rh="edit" onClick={onEdit(innerGroup._id)}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
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
                            {checkStatus(-1, deviceS(item.sportsman)?.status)}
                            {/*{checkStatus(0, deviceS(item.sportsman)?.status)}*/}
                            {/*{checkStatus(1, deviceS(item.sportsman)?.status)}*/}
                            {/*{checkStatus(2, deviceS(item.sportsman)?.status)}*/}
                            {/*{checkStatus(3, deviceS(item.sportsman)?.status)}*/}
                            {checkStatus(4, deviceS(item.sportsman)?.status)}
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
