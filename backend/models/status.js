const { objectDB } = require("../database/conectDB.js")

function getStatusById(id){
    try {
        const sql = "SELECT * FROM user_status WHERE id_status = ?"
        const stmt = objectDB.prepare(sql)
        const statusExists = stmt.get(id)

        if (!statusExists) {
            return null
        }

        const { id_status, name } = statusExists

        return { id: id_status, name }
    } catch (error) {
        throw error
    }
}

module.exports = { getStatusById }