const pool = require("../../bd/pg");

/**
 * Obtener todos los problemas
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const getAllProblems = (request, response) => {
    const query = 'SELECT * FROM "Problem" ORDER BY problem_id ASC';
    pool.query(query, (error, results) => {
        if(error) return response.send(error);
        response.status(200).json(results.rows)
    })
}

/**
 * Obtener problemas por dificultad
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const getProblemsByDifficulty = (request, response) => {
    const difficulty = request.params.difficulty;
    const query = 'SELECT * FROM "Problem" WHERE difficulty = $1';
    pool.query(query, [difficulty], (error, results) => {
        if(error) return response.send(error);
        response.status(200).json(results.rows);
    })
}

/**
 * Obtener un problema por ID
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const getProblemById = (request, response) => {
    const id = request.params.id;
    const query = 'SELECT * FROM "Problem" WHERE problem_id = $1';
    pool.query(query, [id], (error, results) => {
        if(error) return response.send(error);
        response.status(200).json(results.rows);
    })
}

module.exports = {
    getAllProblems,
    getProblemsByDifficulty,
    getProblemById
}