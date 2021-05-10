//Queries de problems

const pool = require("../../bd/pg");

const createProblem=(request,response)=>{
    const problem = request.body.problem;
    const query = 'SELECT * FROM "Problem" WHERE name = $1';
    pool.query(query, [problem.name],
    (err, res) => {
        if(err){
            return err;
        };
        if(res.rows.length === 0){
            const newProblem = postProblem(problem);
            return response.status(201).send(newProblem);
        }
        response.status(200).json(res.rows);
    })
}

const postProblem = (problem) => {
    const query = "INSERT INTO \"User\"(description, difficulty, solution, active, template, name) VALUES ($1, $2, $3,true, $6, $7)";
    pool.query(query, [problem.name, user.description, problem.difficulty,problem.solution,problem.template], (err, res) => {
        if(err) return err;
        return res.rows;
    });
}


const readProblems=(request,response)=>{
    pool.query('SELECT * FROM "Problem" ORDER BY problem_id ASC', (error,results)=>{
        if(error){
            throw error;
        }
        response.status(200).json(results.rows)
    })
}

const getProblemById=(request,response)=>{
    const problem_id=parseInt(request.body.problem_id);
    pool.query('SELECT * FROM "Problem" WHERE problem_id = $1',[problem_id],(error,results)=>{
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

// const getUsers = (request, response) => {
//   pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(200).json(results.rows)
//   })
// }

// const getUserById = (request, response) => {
//   const id = parseInt(request.params.id)

//   pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(200).json(results.rows)
//   })
// }

module.exports={
    createProblem,
    readProblems,
    getProblemById
}