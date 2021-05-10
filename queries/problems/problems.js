//Queries de problems

const pool = require("../../bd/pg");




const readProblems=(request,response)=>{
    pool.query('SELECT * FROM "Problem" ORDER BY problem_id ASC', (error,results)=>{
        if(error){
            return error;
        }
        response.status(200).json(results.rows)
    })
}





module.exports={
    createProblem,
    readProblems,
    getProblemById
}