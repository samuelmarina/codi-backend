const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'postgres',
    host: '35.202.2.214',
    database: 'xbzkedtk',
    password: 'mwook95gpl822zvf',
    port: 5432,
});

module.exports = pool;