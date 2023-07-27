import React, { FC, useRef } from 'react';
import { observer } from 'mobx-react';
import { v4 } from 'uuid';
import ReactToPrint, { PrintContextConsumer } from 'react-to-print';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { story } from '@/story/story';
import { IReport } from '@/types/IReport';
import { ContentReport } from '@/modules/reports/components/ContentReport/ContentReport';

import styles from './styles.module.scss';

interface IProps {
    open: boolean;
    onClose: () => void;
    report: IReport;
}

export const DialogReportContainer: FC<IProps> = observer(({ open, onClose, report }: IProps) => {
    const refReport = useRef<HTMLDivElement>(null);

    return (
        <Dialog open={open} onClose={onClose} maxWidth={false}>
            <div ref={refReport} className={styles.report}>
                <div className={styles.logo}>
                    <img
                        src={window.api.getFilePath(story.competition?.logo || window.api.DEFAULT_COMPETITION_LOGO)}
                        alt="logo"
                    />
                </div>

                <DialogTitle className={styles.title}>{report.name}</DialogTitle>

                {/*<DialogContentText className={styles.header}>Fourth round - Khorfakan - 10 sep 2022</DialogContentText>*/}
                {/*<DialogContentText className={styles.header}>Final Results</DialogContentText>*/}
                {/*<DialogContentText className={styles.header}>RUNABOUT OPEN</DialogContentText>*/}

                <DialogContent>
                    <ContentReport key={v4()} report={report} />
                </DialogContent>

                <table className={styles.footer}>
                    <tr>
                        <th>{story.competition?.official1_title || 'Race Timekeeper'}</th>
                        <th>{story.competition?.official2_title || 'Race Director'}</th>
                        <th>{story.competition?.official3_title || 'O.O.D.'}</th>
                    </tr>
                    <tr>
                        <td>{story.competition?.official1_name || '-'}</td>
                        <td>{story.competition?.official2_name || '-'}</td>
                        <td>{story.competition?.official3_name || '-'}</td>
                    </tr>
                </table>
            </div>
            <DialogActions>
                <ReactToPrint content={() => refReport.current}>
                    <PrintContextConsumer>
                        {({ handlePrint }) => (
                            <IconButton onClick={handlePrint}>
                                <PrintIcon />
                            </IconButton>
                        )}
                    </PrintContextConsumer>
                </ReactToPrint>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
});
