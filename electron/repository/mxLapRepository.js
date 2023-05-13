const { db } = require('./repository');

const mxLapInsert = (lap) => {
    return db.mx_lap.insert(lap);
};

const mxLaps = async (session) => {
    let result = await db.mx_lap.find({session});
    return result;
};

module.exports = {
    mxLapInsert,
    mxLaps
};
