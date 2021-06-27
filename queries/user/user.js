const pool = require("../../bd/pg");

/**
 * Editar el nombre de un usuario
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const editUser = (request, response) => {
  const user = request.body.user;
  const query = 'UPDATE "User" SET name = $1 WHERE google_id = $2';
  pool.query(query, [user.name, user.google_id], (err, res) => {
    if (err) {
      return response.status(400).send(error);
    }
    response.status(200).json("success");
  });
};

/**
 * Actualizar el estado de premium de un usuario
 * @param {Number} id user_id
 */
const disablePremiumUser = (id) => {
  const query = 'UPDATE "User" SET premium = FALSE WHERE user_id = $1';
  pool.query(query, [id], (err, res) => {
    if (err) {
      console.log("Error");
    } else {
      console.log("Success");
    }
  });
};

module.exports = {
  editUser,
  disablePremiumUser,
};
