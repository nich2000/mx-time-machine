const { db } = require('./repository');

const mxLapInsert = (lap) => {
    return db.mx_lap.insert(lap);
};

const mxLaps = async (session) => {
    let result = await db.mx_lap.find({session}).sort({device: 1, num: 1});
    return result;
};

module.exports = {
    mxLapInsert,
    mxLaps
};
