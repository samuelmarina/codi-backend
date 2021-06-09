const pool = require("../../bd/pg");

/**
 * Editar el nombre de un usuario
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const editUser = (request, response) => {
    const user = request.body.user;
    const query = 'UPDATE "User" SET name = $1 WHERE google_id = $2';
    pool.query(query, [user.name, user.google_id],
    (err, res) => {
        if(err){
            return err;
        };
        response.status(200).json("success");
    })
}

module.exports = {
    editUser,
}