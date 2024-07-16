const { db } = require('./repository');

const mxSessionInsert = (session) => {
    return db.mx_session.insert(session);
};

const mxSessions = async (competitionId) => {
    let result = await db.mx_session.find({competitionId} | undefined).sort({sessionId: -1});
    return result;
};

module.exports = {
    mxSessionInsert,
    mxSessions
};
