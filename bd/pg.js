const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'awpwyxhpkcvvvj',
    host: 'ec2-52-204-141-94.compute-1.amazonaws.com',
    database: 'd2qnjr75k6r8c8',
    password: '82bdfebc67ce8b08daa3aee81953a8e01556d2a054b16b6c387ce6c9b0e29df1',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;