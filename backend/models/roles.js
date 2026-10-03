const { objectDB } = require("../database/conectDB.js")

function getRoleById(id){
    try {
        const sql = "SELECT * FROM role WHERE id_role = ?"
        const stmt = objectDB.prepare(sql)
        const roleExists = stmt.get(id)

        if (!roleExists) {
            return null
        }

        const { id_role, name } = roleExists

        return { id: id_role, name }
    } catch (error) {
        throw error
    }
}

module.exports = { getRoleById }