const { ipcMain } = require('electron');
const {
    mxResultUpdate
} = require('../repository/mxResultRepository');

ipcMain.on('mx-result-set-request', async (e, device, session, result) => {
    const newResult = await mxResultUpdate(device, session, result);
    // sendToAllMessage('mx-result-set-response', newResult);
    // console.log("[DEBUG] mx-result-set-request, result: " + newResult);
});
