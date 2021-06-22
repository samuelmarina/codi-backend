const pool = require("../../bd/pg");
const axios = require('axios');

const endpoint = 'https://codexweb.netlify.app/.netlify/functions/enforceCode';
const header = {
    'Content-Type': 'application/json',
};

/**
 * Ejecutar código con un solo input
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const tryCode = async (request, response) => {
    const { code, lang, problemId } = request.body.codeInfo;
    const client = await pool.connect();

    const testCases = await getProblemInput(client, response, problemId);
    const input = testCases[0].input;
    const output = testCases[0].output;

    const result = await executeCode(response, code, lang, input);
    const resultOutput = result.output.trim();

    client.release();

    return response.status(200).send({
        status: resultOutput === output,
        output: resultOutput,
        expectedOutput: output,
    })
}

/**
 * Obtener todos los test cases de un
 * problema
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response
 * @param {Number} problemId número ID del problema
 * @returns Arreglo de test cases
 */
const getProblemInput = async (client, response, problemId) => {
    const query = 'SELECT input, output FROM "Test_Case" WHERE problem_id = $1 AND active = TRUE';

    try {
        const results = await client.query(query, [problemId]);
        return results.rows;
    } catch (error) {
        client.release();
        return response.status(400).send(error);
    }
}

/**
 * Compilar el código en línea
 * @param {JSON} response HTTP response
 * @param {String} code code to execute
 * @param {String} language programming language
 * @param {String} input code input
 */
const executeCode = async (response, code, language, input) => {
    const data = JSON.stringify({
        "code": code,
        "language": language,
        "input": input
    });

    try {
        const results = await axios.post(endpoint, data, {
            headers: header
        });
        return results.data;
        
    } catch (error) {
        client.release();
        return response.status(400).send(error);
    }
}

module.exports = {
    tryCode,
}