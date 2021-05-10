const pool = require("../../bd/pg");

/**
 * Loguear a un usuario
 * @param {JSON} request HTTP request
 * @param {JSON} response HTTP response
 */
const loginUser = (request, response) => {
    const user = request.body.user;
    const query = 'SELECT * FROM "User" WHERE google_id = $1';
    pool.query(query, [user.google_id],
    (err, res) => {
        if(err){
            return err;
        };
        if(res.rows.length === 0){
            const newUser = createUser(user);
            return response.status(201).send(newUser);
        }
        response.status(200).json(res.rows);
    })
}

/**
 * Agregar un usuario a la base de datos
 * @param {JSON} user Objeto con info del usuario
 */
const createUser = (user) => {
    const query = "INSERT INTO \"User\"(google_id, name, pic_url, premium, is_admin, active) VALUES ($1, $2, $3, false, false, true)";
    pool.query(query, [user.google_id, user.name, user.pic_url], (err, res) => {
        if(err) return err;
        return res.rows;
    });
}









// const createProblem=(request,response)=>{
//     const problem = request.body.problem;
//     const query = 'SELECT * FROM "Problem" WHERE name = $1';
//     pool.query(query, [problem.name],
//     (err, res) => {
//         if(err){
//             return err;
//         };
//         if(res.rows.length === 0){
//             const newProblem = postProblem(problem);
//             return response.status(201).send(newProblem);
//         }
//         response.status(200).json(res.rows);
//     })
// }

// const postProblem = (problem) => {
//     const query = "INSERT INTO \"User\"(description, difficulty, solution, active, template, name) VALUES ($1, $2, $3,true, $6, $7)";
//     pool.query(query, [problem.name, user.description, problem.difficulty,problem.solution,problem.template], (err, res) => {
//         if(err) return err;
//         return res.rows;
//     });
// }


const readProblems=(request,response)=>{
    pool.query('SELECT * FROM "Problem" ORDER BY problem_id ASC', (error,results)=>{
        if(error){
            throw error;
        }
        response.status(200).json(results.rows)
    })
}

// const getProblemById=(request,response)=>{
//     const problem_id=parseInt(request.body.problem_id);
//     pool.query('SELECT * FROM "Problem" WHERE problem_id = $1',[problem_id],(error,results)=>{
//         if (error) {
//             throw error
//         }
//         response.status(200).json(results.rows)
//     })
// }




module.exports = {
    readProblems,
    loginUser,
   
}