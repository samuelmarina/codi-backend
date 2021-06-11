const pool = require("../../bd/pg");

/**
 * Loguear a un usuario
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const loginUser = async (request, response) => {
    const user = request.body.user;
    const query = 'SELECT * FROM "User" WHERE google_id = $1';
    const client = await pool.connect();

    try {
        const results = await client.query(query, [user.google_id]);
        if(results.rows.length === 0){
            const newUser = await createUser(user);
            client.release();
            return response.status(201).send(newUser);
        }
        client.release();
        pool.end();
        return response.status(200).json(results.rows);
    } catch (error) {
        pool.end();
        client.release();
        response.send(error);
    }
}

/**
 * Agregar un usuario a la base de datos
 * @param {JSON} user Objeto con info del usuario
 */
const createUser = async (client, user) => {
    const query = "INSERT INTO \"User\"(google_id, name, pic_url, premium, is_admin, active) VALUES ($1, $2, $3, false, false, true)";
    
    try {
        const results = await client.query(query, [user.google_id, user.name, user.pic_url]);
        return results.rows;
    } catch (error) {
        return error;
    }
}




module.exports = { 
    loginUser,
}