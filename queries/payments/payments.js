const pool = require("../../bd/pg");

const createPayment = async (request, response) => {
  const payment = request.body.payment;
  const client = await pool.connect();

  const query =
    'INSERT INTO "Payment"(date, amount, pm_id, user_id, active, sub_type) VALUES ($1, $2, $3, \
      (SELECT user_id FROM "User" WHERE google_id = $4), TRUE, $5)';

  try {
    const results = await client.query(query, [
      payment.date,
      payment.amount,
      payment.pm_id,
      payment.user_id,
      payment.sub_type,
    ]);
    client.release();
    return response.status(201).send(results.rows);
  } catch (error) {
    client.release();
    return response.status(400).send(error);
  }
};

module.exports = {
  createPayment,
};
