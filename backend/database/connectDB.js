const { DatabaseSync } = require("node:sqlite")
const instanceConfig = require("../config/config.js")
const { readFileSync } = require("node:fs")

function createConnection(path) {
    const databasePath = path
    try {
        // * instanciamos la clase DATABASESYNC, le pasamos por parametro la ruta del archivo de la base de datos y nos devuelve un objeto con operaciones para modificar el archivo CLUB.SQLITE3
        const createConnection = new DatabaseSync(databasePath)
        return createConnection

    } catch (error) {
        throw new Error("Error al conectar con la base de datos: " + error.message);
    }
}

function initTables(objectDB){
    try {
        const sqlSchema = readFileSync(__dirname + "/schema.sql", "utf-8")
        
        objectDB.exec(sqlSchema)
        
        console.log("tablas creadas exitosamente...");

    } catch (error) {
        
        throw new Error("Error al inicializar el schema: " + error.message);
    }
}


let objectDB = null

try {
    
    objectDB = createConnection(instanceConfig.database.path)
    
    initTables(objectDB)

} catch (error) {
    
    console.log(error.message);
    
}

module.exports = { objectDB }