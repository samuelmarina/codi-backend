const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'xbzkedtk',
    host: 'queenie.db.elephantsql.com',
    database: 'xbzkedtk',
    password: 'u4u5TqurSIMhirYyrZgPD9ncKfCo6Y12',
    port: 5432,
});

module.exports = pool;