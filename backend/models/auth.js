const { objectDB } = require("../database/conectDB.js")

function authenticate(emailUser, password) {

    const sql = "SELECT * FROM users WHERE email = ? AND password = ?"
    try {
        // * el OBJETO que contiene la conexion a la DB recibe el texto SQL y comprueba que la sintaxis esta bien escrita. prepare() devuelve un objeto con metodos que inyecta datos a las query SQL y las ejecuta. Devuelve algo.
        const stmt = objectDB.prepare(sql)
        const userExists = stmt.get(emailUser, password)

        if (!userExists) {
            return null
        }

        const { id_user, name, surname, id_role, temporary_password, id_status, email } = userExists

        return { idUser: id_user, name, surname, roleId: id_role, temporaryPassword: temporary_password, statusId: id_status, email }

    } catch (error) {

        throw error
    }

}




module.exports = { authenticate }