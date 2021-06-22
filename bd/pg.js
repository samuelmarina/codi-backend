const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'xbzkedtk',
    host: 'queenie.db.elephantsql.com',
    database: 'xbzkedtk',
    password: 'ZGbtJQnisNsstlkj9b2ieC8ArUMvm6_0',
    port: 5432,
});

module.exports = pool;