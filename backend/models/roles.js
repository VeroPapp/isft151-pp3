const { objectDB } = require("../database/connectDB.js")

function getRoleById(id){
    try {
        const sql = "SELECT * FROM roles WHERE idRole = ?"
        const stmt = objectDB.prepare(sql)
        const roleExists = stmt.get(id)

        if (!roleExists) {
            return null
        }

        const { idRole, name } = roleExists

        return { id: idRole, name }
    } catch (error) {
        throw error
    }
}

module.exports = { getRoleById }