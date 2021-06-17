//Payments Queries
const pool = require("../../bd/pg");

const createPayment = (request, response) => {
  const { date, amount, pm_id, user_id, sub_type } = request.body.payment;

  pool.query(
    'INSERT INTO "Payment" (date, amount, pm_id, user_id, active, sub_type) VALUES ($1, $2,$3,$4,true,$5)',
    [date, amount, pm_id, user_id, sub_type],
    (error, results) => {
      if (error) {
        return error;
      }
      response.status(201).send(results.rows);
    }
  );
};

module.exports = {
  createPayment,
};
