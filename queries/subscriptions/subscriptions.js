const pool = require("../../bd/pg");
const user = require("../user/user");

/**
 * Deshabilitar una subscripcion
 * @param {subscription} Subscription Objeto con informacion de la subscripcion
 */
const disableSubscription = (subscription) => {
  const query = 'UPDATE "Subscription" SET active = FALSE WHERE sub_id = $1';
  pool.query(query, [subscription.sub_id], (err, res) => {
    if (err) {
      console.log("Error");
    } else {
      console.log("Success");
    }
  });
};

/**
 * Chequear Subscripciones activas, Usuarios premium y deshabilitar aquellas que caducaron
 */
const checkingSubs = () => {
  //Getting Date
  const tiempoTranscurrido = Date.now();
  const today = new Date(tiempoTranscurrido);
  //Getting active subscriptions
  const query = 'SELECT * FROM "Subscription" WHERE active = TRUE';
  pool.query(query, (error, results) => {
    if (error) return console.log("Error");
    results.rows.forEach((sub) => {
      const userSubscriptionDate = new Date(sub.end_date);
      if (userSubscriptionDate < today) {
        //actualizar subscripcion.active = false
        disableSubscription(sub);
        //actualizar user.premium = false
        user.disablePremiumUser(sub.user_id);
      }
    });
  });
};

module.exports = {
  checkingSubs,
};
