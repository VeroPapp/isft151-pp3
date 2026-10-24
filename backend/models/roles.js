const { objectDB } = require("../database/connectDB.js")

function getRoleByIdDB(id) {
    try {
        const sql = `
    SELECT idRole, name
    FROM roles
    WHERE idRole = ?
    `;
        const stmt = objectDB.prepare(sql)
        const roleExists = stmt.get(id)

        if (!roleExists) {
            return null
        }

        const { idRole, name } = roleExists

        return { idRole: idRole, nameRole: name }
    } catch (error) {
        throw error
    }
}

module.exports = { getRoleByIdDB }