const { objectDB } = require("../database/connectDB.js")

function authenticate(emailUser, password) {

    const sql = "SELECT * FROM users WHERE email = ? AND password = ?"
    try {
        // * el OBJETO que contiene la conexion a la DB recibe el texto SQL y comprueba que la sintaxis esta bien escrita. prepare() devuelve un objeto con metodos que inyecta datos a las query SQL y las ejecuta. Devuelve algo.
        const stmt = objectDB.prepare(sql)
        const userExists = stmt.get(emailUser, password)

        if (!userExists) {
            return null
        }
        console.log(userExists);

        const { idUser, name, surname, idRole, temporaryPassword, idStatus, email } = userExists

        return { idUser, name, surname, idRole, temporaryPassword, idStatus, email }

    } catch (error) {

        throw error
    }

}




module.exports = { authenticate }