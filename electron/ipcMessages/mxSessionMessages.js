const {
    mxSessionInsert, mxSessions
} = require('../repository/mxSessionRepository');
const { ipcMain } = require('electron');

ipcMain.on('mx-session-insert-request', async (e, session) => {
    const newSession = await mxSessionInsert(session);
    // console.log("[DEBUG] mx-session-insert-request, result: " + newSession);
    // sendToAllMessage('mx-session-insert-response', newSession);
});
