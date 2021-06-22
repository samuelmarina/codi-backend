const pool = require("../../bd/pg");

const createPayment = async (request, response) => {
  const payment = request.body.payment;
  const client = pool.connect();

  const userID = await getUserId(client, response, payment.user_id);
  const query =
    'INSERT INTO "Payment"(date, amount, pm_id, user_id, active, sub_type) VALUES ($1, $2, $3, $4 , TRUE, $5)';

  try {
    const results = (await client).query(query, [
      payment.date,
      payment.amount,
      payment.pm_id,
      userID,
      payment.sub_type,
    ]);
    return response.status(201).send(results.rows);
  } catch (error) {
    return response.status(400).send(error);
  }
};

/**
 * Obtener el user id a partir del google id
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response
 * @param {String} googleId id de google del usuario
 * @returns String id del usuario en la base de datos
 */
const getUserId = async (client, response, googleId) => {
  const query =
    'SELECT user_id FROM "User" WHERE google_id = \'' + googleId + "'";
  try {
    const results = await (await client).query(query);
    return results.rows[0].user_id;
  } catch (error) {
    console.log(error);
    return response.status(400).send(error);
  }
};

module.exports = {
  createPayment,
};
