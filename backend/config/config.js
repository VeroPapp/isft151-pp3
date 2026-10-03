const { readFileSync } = require("node:fs")

function default_config() {
    const config = {
        server: {
            ip: "127.0.0.1",
            port: 3000
        },
        database: {
            path: "./database/club.sqlite3"
        }
    };

    return config;
}


function loadConfig() {

    let config = null

    try {
        // * __dirname obtiene la carpeta donde se encuentra el archivo config.js que se ejecuta actualmente, en este caso C:/backend/config y busca el archivo config.json en esa carpeta.
        const data = readFileSync(__dirname + "/config.json", "utf8")
        config = JSON.parse(data)
        console.log("configuracion cargada...")
        return config

    } catch (error) {

        config = default_config()
        console.error("Error cargando " + __dirname + "/config.json. Usando valores por defecto.");
        return config

    }

}

const InstanceConfig = loadConfig()

module.exports = InstanceConfig