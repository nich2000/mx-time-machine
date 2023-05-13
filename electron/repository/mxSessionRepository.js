const { db } = require('./repository');

const mxSessionInsert = (session) => {
    return db.mx_session.insert(session);
};

const mxSessions = async () => {
    let result = await db.mx_session.find({});
    return result;
};

module.exports = {
    mxSessionInsert,
    mxSessions
};
