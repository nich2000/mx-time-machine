const {
    mxLapInsert
} = require('../repository/mxLapRepository');
const { ipcMain } = require('electron');

ipcMain.on('mx-lap-insert-request', async (e, lap) => {
    const newLap = await mxLapInsert(lap);
    // console.log("[DEBUG] mx-lap-insert-request, result: " + newLap);
    // sendToAllMessage('mx-lap-insert-response', newLap);
});
