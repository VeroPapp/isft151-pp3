const { dbObject } = require("../database/connectionDB.js")

function authenticate(email, password){

    const sql = "SELECT * FROM user WHERE email = ? AND password = ?"

    try {
        
        const stmt = dbObject.prepare(sql)
        const user = stmt.get(email, password)

        if (!user) {

            return null
        }

        return user

    } catch (error) {
        
        throw error
    }

}


module.exports = { authenticate }