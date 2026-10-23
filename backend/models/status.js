const { objectDB } = require("../database/connectDB.js")

function getStatusByIdDB(id){
    try {
        const sql = "SELECT * FROM userStatus WHERE idStatus = ?"
        const stmt = objectDB.prepare(sql)
        const statusExists = stmt.get(id)

        if (!statusExists) {
            return null
        }

        const { idStatus, name } = statusExists

        return { IDStatus: idStatus, nameStatus: name }
    } catch (error) {
        throw error
    }
}

module.exports = { getStatusByIdDB }