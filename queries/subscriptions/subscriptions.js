const pool = require("../../bd/pg");
const user = require("../user/user");

const disableSubscription = (subscription) => {
  const query = 'UPDATE "Subscription" SET active = TRUE WHERE sub_id = $1';
  pool.query(query, [subscription.sub_id], (err, res) => {
    if (err) {
      console.log("Error");
    } else {
      console.log("Success");
    }
  });
};

const checkingSubs = () => {
  //Getting Date
  const tiempoTranscurrido = Date.now();
  const today = new Date(tiempoTranscurrido);
  //Getting active subscriptions
  const query = 'SELECT * FROM "Subscription" WHERE active = FALSE';
  pool.query(query, (error, results) => {
    results.rows.forEach((sub) => {
      const userSubscriptionDate = new Date(sub.end_date);
      if (userSubscriptionDate < today) {
        //actualizar subscripcion.active = false
        disableSubscription(sub);
        //actualizar user.premium = false
        user.disablePremiumUser(sub.user_id);
      }
    });
    if (error) console.log("Error");
  });
};

module.exports = {
  checkingSubs,
};
