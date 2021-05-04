const pool = require("../../bd/pg");

/**
 * Loquear a un usuario
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const loginUser = (request, response) => {
    const user = request.body;
    const query = 'SELECT * FROM "User" WHERE google_id = $1';
    pool.query(query, [user.google_id],
    (err, res) => {
        if(err) throw err;
        if(res.rows.length === 0){
            createUser(user);
            return response.status(201).send('User added with ID: ${user.google_id}');
        }
        response.status(200).json(res.rows);
    })
}

/**
 * Agregar un usuario a la base de datos
 * @param {JSON} user Objeto con info del usuario
 */
const createUser = (user) => {
    const query = "INSERT INTO \"User\"(google_id, name, pic_url, premium, is_admin, active) VALUES ($1, $2, $3, false, false, true)";
    pool.query(query, [user.google_id, user.name, user.pic_url], (err, res) => {
        if(err) throw err;
    });
}

module.exports = {
    loginUser
}