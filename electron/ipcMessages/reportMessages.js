const { reportFindByCompetitionId, reportInsert, reportUpdate, reportDelete } = require('../repository/reportRepository');
const { ipcMain } = require('electron');
const { sendToAllMessage } = require('./sendMessage');
const { mxSessions } = require("../repository/mxSessionRepository");
const { mxResults } = require("../repository/mxResultRepository");
const { mxLaps } = require("../repository/mxLapRepository");
const {competitionFindAll} = require("../repository/competitionRepository");

ipcMain.on('load-reports-request', async (e, competitionId) => {
    const reports = await reportFindByCompetitionId(competitionId);
    e.reply('load-reports-response', reports);
});

ipcMain.handle('handle-load-reports-request', (e, competitionId) => {
    return reportFindByCompetitionId(competitionId);
});

ipcMain.on('report-insert-request', async (e, report) => {
    const count = await reportInsert(report);
    sendToAllMessage('report-insert-response', count);
});

ipcMain.on('report-update-request', async (e, _id, report) => {
    const count = await reportUpdate(_id, report);
    sendToAllMessage('report-update-response', count);
});

ipcMain.on('report-delete-request', async (e, _id) => {
    const count = await reportDelete(_id);
    sendToAllMessage('report-delete-response', count);
});

ipcMain.handle('load-mx-sessions-request', async (e, competitionId) => {
    return mxSessions(competitionId);
});

ipcMain.handle('load-competition-request', async (e) => {
    return competitionFindAll();
});

ipcMain.handle('load-mx-results-request', async (e, session) => {
    return mxResults(session);
});

ipcMain.handle('load-mx-laps-request', async (e, session) => {
    return mxLaps(session);
});
