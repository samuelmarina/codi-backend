const pool = require("../../bd/pg");

/**
 * Loguear a un usuario
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const loginUser = (request, response) => {
    const user = request.body.user;
    const query = 'SELECT * FROM "User" WHERE google_id = $1';
    pool.query(query, [user.google_id],
    (err, res) => {
        if(err){
            return err;
        };
        if(res.rows.length === 0){
            const newUser = createUser(user);
            return response.status(201).send(newUser);
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
        if(err) return err;
        return res.rows;
    });
}




module.exports = {
    
    loginUser
   
}