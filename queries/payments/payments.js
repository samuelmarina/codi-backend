const pool = require("../../bd/pg");

const createPayment = (request, response) => {
    const payment = request.body.payment;
    const query = "INSERT INTO \"Payment\"(date, amount, pm_id, user_id, active, sub_type) VALUES ($1, $2, $3, $4 , TRUE, $5)";
    
    pool.query(query, [payment.date, payment.amount, payment.pm_id, payment.user_id, payment.sub_type], 
        (err, res) => {
            if(err) return err;
            return response.status(201).send(res.rows);
        }
    );
}

module.exports = {
    createPayment,
}