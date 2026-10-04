const { objectDB } = require("../database/connectDB.js")

function getStatusById(id){
    try {
        const sql = "SELECT * FROM userStatus WHERE idStatus = ?"
        const stmt = objectDB.prepare(sql)
        const statusExists = stmt.get(id)

        if (!statusExists) {
            return null
        }

        const { idStatus, name } = statusExists

        return { id: idStatus, name }
    } catch (error) {
        throw error
    }
}

module.exports = { getStatusById }