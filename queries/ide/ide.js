const pool = require("../../bd/pg");
const dateHelper = require("../../helpers/date/date");
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
        input: input,
        output: resultOutput,
        expectedOutput: output,
    });
}

/**
 * Enviar un código para evaluación
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const sendCode = async (request, response) => {
    const { code, lang, problemId } = request.body.codeInfo;
    const { userId } = request.body.user;
    const client = await pool.connect();

    const testCases = await getProblemInput(client, response, problemId);
    let flag = true;
    for (let i = 0; i < testCases.length; i++) {
        const { input, output } = testCases[i];
        const result = await executeCode(response, code, lang, input);
        console.log(result);
        const resultOutput = result.output.trim();

        if (resultOutput !== output) {
            flag = false;
            break;
        }
    }

    const submission = await createSubmission(client, response, flag, {
        user_id: userId,
        problem_id: problemId,
        language: lang,
        code: code,
    });

    client.release();

    response.status(201).send({
        id: submission.id,
        code: code,
        language: lang,
        status: flag ? "Aprobado" : "Desaprobado",
        date: dateHelper.getDate()
    });
}

/**
 * Obtener el código de lenguaje para la librería
 * codex
 * @param {String} lang lenguaje de programación
 * @returns String lenguaje para librería Codex
 */
const getLanguage = (lang) => {
    switch (lang.toLowerCase()) {
        case "java":
            return "java"
        case "python":
            return "py"
        default:
            return "c"
    }
}

/**
 * Agregar una submission a la base de
 * datos del usuario 
 * @param {*} client 
 * @param {*} response 
 * @param {Boolean} solved true si el código fue resuelto
 * @param {JSON} data info del problema y el usuario
 * @returns Array de submission
 */
const createSubmission = async (client, response, solved, data) => {
    const query = 'INSERT INTO "User-Problem"(user_id, problem_id, language, solved, active, code, date) \
    VALUES((SELECT user_id FROM "User" WHERE google_id = $1), $2, $3, $4, TRUE, $5, $6) RETURNING id';

    const {
        user_id,
        problem_id,
        language,
        code,
    } = data;
    
    const date = dateHelper.getTimestamp();

    try {
        const results = await client.query(query, [user_id, problem_id, language, solved, code, date]);
        return results.rows[0];
    } catch (error) {
        return response.status(400).send(error);
    }
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
    const lang = getLanguage(language);
    const data = JSON.stringify({
        "code": code,
        "language": lang,
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
    sendCode
}