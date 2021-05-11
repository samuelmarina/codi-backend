//Payments Queries
const pool = require("../../bd/pg");





// const createPayment = (request, response) => {
//     const payment = request.body.payment;
//     const query = "INSERT INTO \"Payment\"(date,amount,pm_id,user_id,active,sub_type) VALUES ('2016-06-22 19:10:25-07',50,1,1,true,1)";
   
    
//     pool.query(query, (err, res) => {
//         if(err) return err;
//         return response.status(201).send(res.rows);
//     });

    
// }





module.exports={
    createPayment
}