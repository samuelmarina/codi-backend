const pool = require("../../bd/pg");

/**
 * Obtener todos los problemas
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const getAllProblems = (request, response) => {
  const query =
    'SELECT * FROM "Problem" WHERE active = TRUE ORDER BY problem_id ASC';
  pool.query(query, (error, results) => {
    if (error) return response.status(400).send(error);
    response.status(200).json(results.rows);
  });
};

/**
 * Obtener problemas por dificultad
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const getProblemsByDifficulty = (request, response) => {
  const difficulty = request.params.difficulty;
  const userID = request.query.google_id;
  if (difficulty === "all") {
    const query =
      'SELECT "Problem".problem_id, "Problem".description, "Problem".difficulty, "Problem".solution, \
            "Problem".name, CASE WHEN "Problem".problem_id = submission.problem_id THEN True ELSE False END AS solved \
            FROM "Problem" LEFT JOIN (SELECT "User-Problem".problem_id FROM "User-Problem" \
            INNER JOIN "User" ON "User".user_id = "User-Problem".user_id WHERE "User".google_id = $1 AND "User-Problem".solved = True \
            GROUP BY "User-Problem".problem_id) AS submission ON "Problem".problem_id = submission.problem_id \
            WHERE "Problem".active = True ORDER BY "Problem".problem_id ASC';
    pool.query(query, [userID], (error, results) => {
      if (error) return response.status(400).send(error);
      response.status(200).json(results.rows);
    });
  } else {
    const query =
      'SELECT "Problem".problem_id, "Problem".description, "Problem".difficulty, "Problem".solution, \
            "Problem".name, CASE WHEN "Problem".problem_id = submission.problem_id THEN True ELSE False END AS solved \
            FROM "Problem" LEFT JOIN (SELECT "User-Problem".problem_id FROM "User-Problem" \
            INNER JOIN "User" ON "User".user_id = "User-Problem".user_id WHERE "User".google_id = $1 AND "User-Problem".solved = True \
            GROUP BY "User-Problem".problem_id) AS submission ON "Problem".problem_id = submission.problem_id \
            WHERE "Problem".difficulty = $2 AND "Problem".active = True ORDER BY "Problem".problem_id ASC';
    pool.query(query, [userID, difficulty], (error, results) => {
      if (error) return response.status(400).send(error);
      response.status(200).json(results.rows);
    });
  }
};

/**
 * Obtener un problema por ID
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */

const getProblemById = async (request, response) => {
  const id = request.params.id;
  const client = await pool.connect();
  let problemInfo = {};

  const problem = await getProblemById2(client, response, id);
  const templates = await getProblemTemplates(client, response, id);
  const testCases = await getProblemTestCases(client, response, id);
  problemInfo = {
    ...problem,
    solutionCode: problem.solutioncode,
    templates: templates,
    testCases: testCases,
  };

  delete problemInfo.solutioncode;

  client.release();

  response.status(200).json(problemInfo);
};

/**
 * Obtener toda la info de un problema
 * y los submissions de un usuario al mismo
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const getProblemsWithSubmissions = async (request, response) => {
  const problemId = request.query.problem_id;
  const userId = request.query.google_id;
  const client = await pool.connect();

  const problem = await getProblemById2(client, response, problemId);
  const templates = await getProblemTemplates(client, response, problemId);
  let submissions = await getUserSubmissions(
    client,
    response,
    problemId,
    userId
  );

  client.release();

  submissions = submissions.map((s) => {
    return {
      ...s,
      date: changeDateFormat(s.date),
    };
  });

  const problemInfo = {
    ...problem,
    solutionCode: problem.solutioncode,
    templates,
    submissions,
  };

  delete problemInfo.solutioncode;

  response.status(200).json(problemInfo);
};

/**
 * Cambiar el formato de una fecha
 * @param {String} date fecha en formato timestamp
 * @returns String fecha en formato dd/mm/yyyy
 */
const changeDateFormat = (date) => {
  const temp = new Date(date);
  const dd = String(temp.getDate()).padStart(2, "0");
  const mm = String(temp.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = temp.getFullYear();

  return dd + "/" + mm + "/" + yyyy;
};

/**
 * Obtener todas las submissions de un
 * usuario en un problema
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response
 * @param {Number} problemId ID del problema
 * @param {String} userId ID del usuario
 * @returns Array de objetos de tipo submission
 */
const getUserSubmissions = async (client, response, problemId, userId) => {
  const query =
    "SELECT id, code, language, solved,\
    CASE WHEN solved = TRUE THEN 'Aprobado' ELSE 'Desaprobado' END as status, date FROM \"User-Problem\" \
    WHERE problem_id = $1 AND active = TRUE AND user_id = (SELECT user_id FROM \"User\" WHERE google_id = $2)\
    ORDER BY date DESC";

  try {
    const results = await client.query(query, [problemId, userId]);
    return results.rows;
  } catch (error) {
    return response.status(400).send(error);
  }
};

/**
 * Obtener la info principal de un
 * problema por ID
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response
 * @param {Number} id id el problema
 * @returns JSON objeto con info del problema
 */
const getProblemById2 = async (client, response, id) => {
  const query =
    'SELECT description, difficulty, solution, name, code AS solutionCode FROM "Problem" WHERE problem_id = $1';
  try {
    const results = await client.query(query, [id]);
    return results.rows[0];
  } catch (error) {
    return response.status(400).send(error);
  }
};

/**
 * Obtener todos los templates de
 * un problema por ID
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response
 * @param {Number} id id el problema
 * @returns Array de objetos de tipo template
 */
const getProblemTemplates = async (client, response, id) => {
  const query =
    'SELECT language, code, temp_id AS id FROM "Template" WHERE problem_id = $1';
  try {
    const results = await client.query(query, [id]);
    return results.rows;
  } catch (error) {
    return response.status(400).send(error);
  }
};

/**
 * Obtener todos los test cases
 * de un problema por ID
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response
 * @param {Number} id id el problema
 * @returns Array de objetos de tipo test case
 */
const getProblemTestCases = async (client, response, id) => {
  const query =
    'SELECT input, output, test_id AS id FROM "Test_Case" WHERE problem_id = $1 AND active = TRUE';
  try {
    const results = await client.query(query, [id]);
    return results.rows;
  } catch (error) {
    return response.status(400).send(error);
  }
};

/**
 * Crear un nuevo problema
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const postProblem = async (request, response) => {
  const problem = request.body.problem;
  const client = await pool.connect();

  const problemId = await createNewProblem(client, response, problem);

  problem.templates.forEach(async (temp) => {
    await createNewTemplate(client, response, temp, problemId);
  });

  problem.testCases.forEach(async (tc) => {
    await createNewTestCase(client, response, tc, problemId);
  });

  client.release();

  response.status(201).json("Problem succesfully created");
};

/**
 * Insertar un nuevo problema a la base
 * de datos
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response
 * @param {JSON} data objeto con información del problema
 * @returns String ID del problema creado
 */
const createNewProblem = async (client, response, data) => {
  const query =
    'INSERT INTO "Problem"(description, difficulty, solution, code, active, name) \
    VALUES($1, $2, $3, $4, TRUE, $5) RETURNING problem_id';

  try {
    const results = await client.query(query, [
      data.description,
      data.difficulty,
      data.solution,
      data.solutionCode,
      data.name,
    ]);
    return results.rows[0].problem_id;
  } catch (error) {
    return response.status(400).send(error);
  }
};

/**
 * Insertar un nuevo template a la base
 * de datos
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response
 * @param {JSON} template objeto tipo template
 * @param {Number} problemID número ID del problema
 * @returns String ID del template creado
 */
const createNewTemplate = async (client, response, template, problemID) => {
  const query =
    'INSERT INTO "Template"(language, code, problem_id) \
    VALUES($1, $2, $3) RETURNING temp_id';

  try {
    const results = await client.query(query, [
      template.language,
      template.code,
      problemID,
    ]);
    return results.rows[0].temp_id;
  } catch (error) {
    response.status(400).send(error);
  }
};

/**
 * Insertar un nuevo test case a la
 * base de datos
 * @param {Promise} client objeto de postgresql
 * @param {Hanlder} response manejo del response
 * @param {JSON} testCase objeto tipo test case
 * @param {Number} problemID número ID del problema
 * @returns String ID del test case creado
 */
const createNewTestCase = async (client, response, testCase, problemID) => {
  const query =
    'INSERT INTO "Test_Case"(input, output, problem_id, active) \
    VALUES($1, $2, $3, TRUE) RETURNING test_id';

  try {
    const results = await client.query(query, [
      testCase.input,
      testCase.output,
      problemID,
    ]);
    return results.rows[0].test_id;
  } catch (error) {
    response.status(400).send(error);
  }
};

/**
 * Actualizar un problema y sus correspondientes tablas relaciones
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 *
 */
const updateProblemById = async (request, response) => {
  const problem = request.body.problem;
  const client = await pool.connect();

  await updateProblem(client, response, problem);

  problem.templates.forEach(async (tem) => {
    await updateTemplate(client, response, tem, problem.problem_id);
  });

  await deleteTestCases(client, response, problem.problem_id);

  problem.testCases.forEach(async (tc) => {
    await createNewTestCase(client, response, tc, problem.problem_id);
  });

  client.release();

  response.status(200).send(`Problem modified with ID: ${problem.problem_id}`);
};

/**
 * Actualizar el problema propuesto en la tabla problemas
 * @param {Promise} client objeto de postgresql
 * @param {Handler} response manejo del response
 * @param {JSON} data objeto con información del problema
 *
 */
const updateProblem = async (client, response, data) => {
  const query =
    'UPDATE "Problem" SET description = $1, difficulty = $2, solution = $3, code = $4, name = $5 \
    WHERE problem_id = $6';

  try {
    await client.query(query, [
      data.description,
      data.difficulty,
      data.solution,
      data.solutionCode,
      data.name,
      data.problem_id,
    ]);
  } catch (error) {
    return response.status(400).send(error);
  }
};

/**
 *
 * @param {Promise} client objeto de postgresql
 * @param {Handler} response manejo del response
 * @param {JSON} template objeto tipo template
 * @param {Number} problemID el id del problema
 */
const updateTemplate = async (client, response, template, problemID) => {
  const query =
    'UPDATE "Template" SET code = $1 WHERE language = $2 AND problem_id = $3';

  try {
    await client.query(query, [template.code, template.language, problemID]);
  } catch (error) {
    response.status(400).send(error);
  }
};

/**
 * Eliminar todos los test cases de un
 * problema
 * @param {Promise} client objeto de postgresql
 * @param {Handler} response manejo del response
 * @param {Number} problemID id del problema
 *
 */
const deleteTestCases = async (client, response, problemID) => {
  const query = 'DELETE FROM "Test_Case" WHERE problem_id = $1 ';

  try {
    await client.query(query, [problemID]);
  } catch (error) {
    return response.status(400).send(error);
  }
};

module.exports = {
  getAllProblems,
  getProblemsByDifficulty,
  getProblemById,
  postProblem,
  getProblemsWithSubmissions,
  updateProblemById,
};
