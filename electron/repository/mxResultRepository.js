const { db } = require('./repository');

const mxResultUpdate = async (device, session, result) => {
    // console.log("[DEBUG] mxResultUpdate");

    let count;

    let _result = await db.mx_result.find({ device, session });
    if (_result.length === 0) {
        await db.mx_result.insert(result);
        count = 1;

        // console.log("[DEBUG] mxResultUpdate, insert: " + device + ", count: " + count);
    } else {
        count = await db.mx_result.update(
            { device, session },
            {
                $set: {
                    ...result
                }
            }
        );

        // console.log("[DEBUG] mxResultUpdate, update: " + device + ", count: " + count);
    }

    return count;
};

const mxResults = async (session) => {
    let result = await db.mx_result.find({session});
    return result;
};

module.exports = {
    mxResultUpdate,
    mxResults
};
