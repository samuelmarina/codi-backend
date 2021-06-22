const { response } = require("express");
const pool = require("../../bd/pg");

/**
 * Loguear a un usuario
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const loginUser = async (request, response) => {
    const user = request.body.user;
    const client = await pool.connect();

    let loggedUser = await getUser(client, response, user);

    if (loggedUser.length === 0) {
        const newUser = await createUser(client, response, user);
        client.release();
        return response.status(201).json(newUser);
    }
    client.release();
    response.status(200).json(loggedUser);
}

/**
 * Agregar un usuario a la base de datos
 * @param {JSON} user Objeto con info del usuario
 */
const createUser = async (client, response, user) => {
    const query = "INSERT INTO \"User\"(google_id, name, pic_url, premium, is_admin, active) \
    VALUES ($1, $2, $3, false, false, true) RETURNING user_id";

    try {
        const results = await client.query(query, [user.google_id, user.name, user.pic_url]);
        return results.rows;
    } catch (error) {
        return response.status(400).send(error);
    }
}

const getUser = async (client, response, user) => {
    const query = 'SELECT * FROM "User" WHERE google_id = $1';

    try {
        const results = await client.query(query, [user.google_id]);
        return results.rows;
    } catch (error) {
        return response.status(400).send(error);
    }
}




module.exports = {
    loginUser,
}