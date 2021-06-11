const pool = require("../../bd/pg");

/**
 * Obtener todos los problemas
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const getAllProblems = (request, response) => {
    const query = 'SELECT * FROM "Problem" WHERE active = TRUE ORDER BY problem_id ASC';
    pool.query(query, (error, results) => {
        if(error){
            pool.end();
            return response.send(error);
        }
        pool.end();
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
    const userID = request.query.google_id;
    if(difficulty === 'all'){
        const query = 'SELECT "Problem".problem_id, "Problem".description, "Problem".difficulty, "Problem".solution, \
            "Problem".name, CASE WHEN "Problem".problem_id = submission.problem_id THEN True ELSE False END AS solved \
            FROM "Problem" LEFT JOIN (SELECT "User-Problem".problem_id FROM "User-Problem" \
            INNER JOIN "User" ON "User".user_id = "User-Problem".user_id WHERE "User".google_id = $1 AND "User-Problem".solved = True \
            GROUP BY "User-Problem".problem_id) AS submission ON "Problem".problem_id = submission.problem_id \
            WHERE "Problem".active = True';
            pool.query(query, [userID], (error, results) => {
                if(error) {
                    pool.end();
                    return response.send(error);
                }
                pool.end();
                response.status(200).json(results.rows);
            });
    }
    else{
        const query = 'SELECT "Problem".problem_id, "Problem".description, "Problem".difficulty, "Problem".solution, \
            "Problem".name, CASE WHEN "Problem".problem_id = submission.problem_id THEN True ELSE False END AS solved \
            FROM "Problem" LEFT JOIN (SELECT "User-Problem".problem_id FROM "User-Problem" \
            INNER JOIN "User" ON "User".user_id = "User-Problem".user_id WHERE "User".google_id = $1 AND "User-Problem".solved = True \
            GROUP BY "User-Problem".problem_id) AS submission ON "Problem".problem_id = submission.problem_id \
            WHERE "Problem".difficulty = $2 AND "Problem".active = True';
            pool.query(query, [userID, difficulty], (error, results) => {
                if(error) {
                    pool.end();
                    return response.send(error);
                }
                pool.end();
                response.status(200).json(results.rows);
            });
    }
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
        if(error) {
            pool.end();
            return response.send(error);
        }
        pool.end();
        response.status(200).json(results.rows);
    })
}

module.exports = {
    getAllProblems,
    getProblemsByDifficulty,
    getProblemById
}