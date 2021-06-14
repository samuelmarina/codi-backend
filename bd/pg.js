const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'postgres',
    host: '35.202.2.214',
    database: 'xbzkedtk',
    password: 'ZGbtJQnisNsstlkj9b2ieC8ArUMvm6_0',
    port: 5432,
});

module.exports = pool;