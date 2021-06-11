const pool = require("../../bd/pg");
const math = require("../../helpers/math/math");

/**
 * Obtener las estadísticas de un usuario
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const getUserStatistics = async (request, response) => {
    const userId = request.params.userId;
    const data = {};
    const client = pool.connect();
    
    const totalProblems = await getTotalProblems(client, response);
    const totalProblemsByDifficulty = await getTotalProblemsSolved(client, response, userId);
    data['problems'] = getProblemsObject(totalProblems, totalProblemsByDifficulty);

    const totalProblemsSolved = await getTotalProblemsBySolved(client, response, userId);
    if(totalProblemsSolved.length === 0){
        data['submissions'] = 0;
    }
    else{
        const notSolved = parseInt(totalProblemsSolved[0].count);
        const solved = parseInt(totalProblemsSolved[1].count);
        data['submissions'] = math.getPercentage(solved, solved+notSolved);
    }
    
    const totalLanguages = await getTotalLanguages(client, response, userId);
    data['languages'] = totalLanguages;

    const monthlySubmissions = await getSubmissionsPerMonth(client, response, userId);
    data['monthlySubmissions'] = monthlySubmissions;
    
    response.status(200).send(data);
}

/**
 * Obtener un arreglo con la cantidad de submissions
 * de un usuario agrupados por fecha del año actual
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response 
 * @param {String} userID ID del usuario
 * @returns Arreglo de objeto con fecha y count
 */
const getSubmissionsPerMonth = async (client, response, userID) => {
    const query = 'SELECT DATE_TRUNC(\'month\', date) AS month, COUNT(id) AS count \
    FROM "User-Problem" WHERE DATE_PART(\'year\', date) = DATE_PART(\'year\', CURRENT_DATE) AND \
    user_id = (SELECT user_id FROM "User" WHERE google_id = $1) AND active = TRUE GROUP BY DATE_TRUNC(\'month\', date)';

    try{
        const results = await (await client).query(query, [userID]);
        return results.rows;
    } catch(error) {
        return response.send("Error");
    }
}

/**
 * Obtener objeto que contenga toda la data
 * de los problemas resueltos por un usuario
 * @param {JSON} totalProblems problemas existentes
 * @param {JSON} totalSolved problemas resueltos
 * @returns JSON de problemas por dificultad y conteo de resuelto y totalidad
 */
const getProblemsObject = (totalProblems, totalSolved) => {
    const data = [
        { difficulty: 'easy', solved: 0, total: 0},
        { difficulty: 'medium', solved: 0, total: 0},
        { difficulty: 'hard', solved: 0, total: 0}
    ];

    totalProblems.forEach(x => {
        let i;
        switch (x.difficulty) {
            case 'easy':
                i = 0;
                break;
            case 'medium':
                i = 1;
                break;
            default:
                i = 2;
                break;
        }

        data[i].total = x.count;
    });

    totalSolved.forEach(x => {
        let i;
        switch (x.difficulty) {
            case 'easy':
                i = 0;
                break;
            case 'medium':
                i = 1;
                break;
            default:
                i = 2;
                break;
        }

        data[i].solved = x.count;
    });

    return data;
}

/**
 * Obtener la cantidad de problemas totales
 * existentes por dificultad
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response 
 * @returns Arreglo de problema por dificultad y conteo
 */
const getTotalProblems = async (client, response) => {
    const query = 'SELECT COUNT(*), difficulty FROM "Problem" WHERE active = TRUE GROUP BY difficulty';

    try{
        const results = await (await client).query(query);
        return results.rows;
    } catch(error) {
        return response.send("Error");
    }
}

/**
 * Obtener la cantidad de problemas que un
 * usuario ha resuelto por dificultad
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response 
 * @param {String} userID ID del usuario
 * @returns Arreglo de dificultados y conteo 
 */
const getTotalProblemsSolved = async (client, response, userID) => {
    const query = 'SELECT COUNT(*), difficulty FROM (SELECT "Problem".difficulty FROM "User-Problem" INNER JOIN "Problem" ON "User-Problem".problem_id = "Problem".problem_id WHERE user_id = (SELECT user_id FROM "User" WHERE google_id = $1) AND solved = TRUE GROUP BY "Problem".problem_id) AS problems GROUP BY problems.difficulty';

    try{
        const results = await (await client).query(query, [userID]);
        return results.rows;
    } catch(error) {
        return response.send("Error");
    }
}


/**
 * Obtener la cantidad de problemas que un 
 * usuario ha resuelto y que no ha resuelto
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response 
 * @param {String} userID ID del usuario
 * @returns Arreglo con problemas resueltos y no resueltos y conteo
 */
const getTotalProblemsBySolved = async (client, response, userID) => {
    const query = 'SELECT COUNT(id), solved FROM "User-Problem" WHERE user_id = (SELECT user_id FROM "User" WHERE google_id = $1) GROUP BY solved';
    
    try{
        const results = await (await client).query(query, [userID]);
        return results.rows;
    } catch(error) {
        return response.send("Error");
    }
}

/**
 * Obtener la cantidad de veces que cada lenguaje
 * ha sido utilizado
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response 
 * @param {String} userID ID del usuario
 * @returns Arreglo de lenguaje y conteo de uso
 */
const getTotalLanguages = async (client, response, userID) => {
    const query = 'SELECT COUNT(id), language FROM "User-Problem" WHERE user_id = (SELECT user_id FROM "User" WHERE google_id = $1) GROUP BY language';
    try{
        const results = await (await client).query(query, [userID]);
        return results.rows;
    } catch(error) {
        return response.send("Error");
    }
}



module.exports = {
    getUserStatistics
}