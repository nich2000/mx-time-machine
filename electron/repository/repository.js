const { app } = require('electron');
const Datastore = require('nedb-promises');
const isDev = require('electron-is-dev');

const dbFactory = (fileName) =>
    Datastore.create({
        filename: `${isDev ? '.' : app.getPath('userData')}/db/${fileName}`,
        timestampData: true,
        autoload: true
    });

const db = {
    competition: dbFactory('competition.db'),
    sportsman: dbFactory('sportsman.db'),
    team: dbFactory('team.db'),
    round: dbFactory('round.db'),
    group: dbFactory('group.db'),
    lap: dbFactory('lap.db'),
    report: dbFactory('report.db'),
    broadcast: dbFactory('broadcast.db'),
    mx_result: dbFactory('mx_result.db'),
    mx_lap: dbFactory('mx_lap.db')
};

db.competition.ensureIndex({ fieldName: 'selected' });
db.sportsman.ensureIndex({ fieldName: 'competitionId' });
db.team.ensureIndex({ fieldName: 'competitionId' });
db.round.ensureIndex({ fieldName: 'competitionId' });
db.group.ensureIndex({ fieldName: 'roundId' });
db.lap.ensureIndex({ fieldName: 'memberGroupId' });
db.lap.ensureIndex({ fieldName: 'groupId' });
db.lap.ensureIndex({ fieldName: 'roundId' });

// db.mx_result.ensureIndex({ fieldName: 'memberGroupId' });
// db.mx_result.ensureIndex({ fieldName: 'groupId' });
// db.mx_result.ensureIndex({ fieldName: 'roundId' });
db.mx_result.ensureIndex({ fieldName: 'device' });
// db.mx_result.ensureIndex({ fieldName: 'date' }); // TODO Добавить еще какие-то ключи

// db.mx_lap.ensureIndex({ fieldName: 'memberGroupId' });
// db.mx_lap.ensureIndex({ fieldName: 'groupId' });
// db.mx_lap.ensureIndex({ fieldName: 'roundId' });
db.mx_lap.ensureIndex({ fieldName: 'device' });
// db.mx_lap.ensureIndex({ fieldName: 'date' }); // TODO Добавить еще какие-то ключи

module.exports = { db };
