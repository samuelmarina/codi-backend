const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'xbzkedtk',
    host: 'queenie.db.elephantsql.com',
    database: 'xbzkedtk',
    password: 'ARobSc5VNehbcbXGHZ7gJIo-dKzyKDPq',
    port: 3211,
});

export default pool;