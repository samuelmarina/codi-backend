const pool = require("../../bd/pg");

/**
 * Obtener todos los problemas
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const getAllProblems = (request, response) => {
    const query = 'SELECT * FROM "Problem" ORDER BY problem_id ASC'
    pool.query(query, (error, results) => {
        if(error){
            return error;
        }
        response.status(200).json(results.rows)
    })
}

module.exports = {
    getAllProblems
}