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
    if (error) return response.send(error);
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
            WHERE "Problem".active = True';
    pool.query(query, [userID], (error, results) => {
      if (error) return response.send(error);
      response.status(200).json(results.rows);
    });
  } else {
    const query =
      'SELECT "Problem".problem_id, "Problem".description, "Problem".difficulty, "Problem".solution, \
            "Problem".name, CASE WHEN "Problem".problem_id = submission.problem_id THEN True ELSE False END AS solved \
            FROM "Problem" LEFT JOIN (SELECT "User-Problem".problem_id FROM "User-Problem" \
            INNER JOIN "User" ON "User".user_id = "User-Problem".user_id WHERE "User".google_id = $1 AND "User-Problem".solved = True \
            GROUP BY "User-Problem".problem_id) AS submission ON "Problem".problem_id = submission.problem_id \
            WHERE "Problem".difficulty = $2 AND "Problem".active = True';
    pool.query(query, [userID, difficulty], (error, results) => {
      if (error) return response.send(error);
      response.status(200).json(results.rows);
    });
  }
};

/**
 * Obtener un problema por ID
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const getProblemById = (request, response) => {
  const id = request.params.id;
  const query = 'SELECT * FROM "Problem" WHERE problem_id = $1';
  pool.query(query, [id], (error, results) => {
    if (error) return response.send(error);
    response.status(200).json(results.rows);
  });
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

  response.status(201).send("Problem succesfully created");
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
      data.codeSolution,
      data.name,
    ]);
    return results.rows[0].problem_id;
  } catch (error) {
    return response.send("Error");
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
    response.send("Error");
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
    response.send("Error");
  }
};

/**
 *
 * @param {*} request
 * @param {*} response
 */
const updateProblemById = async (request, response) => {
  const problem = request.body.problem;
  const client = await pool.connect();

  const problemId = await updateProblem(client, response, problem);

  problem.templates.forEach(async (tc) => {
    await updateTemplate(client, response, tc, problemId);
  });

  problem.testCases.forEach(async (temp) => {
    await updateTestCase(client, response, temp, problemId);
  });

  client.release();

  response.status(200).send(`Problem modified with ID: ${problemId}`);
};

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
    return data.problem_id;
  } catch (error) {
    return response.send("Error");
  }
};

const updateTemplate = async (client, response, template, problemID) => {
  const query =
    'UPDATE "Template" SET code = $1 WHERE language = $2 AND problem_id = $3';

  try {
    await client.query(query, [template.code, template.language, problemID]);
  } catch (error) {
    response.send("Error");
  }
};

const updateTestCase = async (client, response, testCase, problemID) => {
  const query =
    'INSERT INTO "Test_Case" (input, output) VALUES ($1,$2) WHERE problem_id = $4 \
    ON CONFLICT (id) DO UPDATE SET (input,output) VALUES ($1,$2) ';
  // UPDATE "Test_Case" SET input = $1, output = $2 WHERE test_id = 2';

  // INSERT INTO customers (name, email)
  // VALUES('Microsoft','hotline@microsoft.com')
  // ON CONFLICT (name)
  // DO
  // UPDATE SET email = EXCLUDED.email || ';' || customers.email;

  try {
    await client.query(query, [
      testCase.input,
      testCase.output,
      testCase.id,
      problemID,
    ]);
  } catch (error) {
    // response.send("Error");
  }
};

module.exports = {
  getAllProblems,
  getProblemsByDifficulty,
  getProblemById,
  postProblem,
  updateProblemById,
};
