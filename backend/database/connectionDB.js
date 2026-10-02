const { DatabaseSync } = require("node:sqlite")
const instanceConfig = require("../config/config.js")


function connectDB(path) {

    const dbPath = path

    try {

        const db = new DatabaseSync(dbPath)

        return db

    } catch (error) {
        throw new Error("Error al conectar con la base de datos: " + error.message);

    }

}


const dbObject = connectDB(instanceConfig.database.path)


module.exports = { dbObject }