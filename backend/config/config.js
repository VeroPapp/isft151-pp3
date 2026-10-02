const { readFileSync } = require("node:fs")

function default_config() {
    const config = {

        server: {
            ip: "127.0.0.1",
            port: 3000
        },
        database: {
            path: "../database/db.sqlite3"
        }
    };

    return config;
}


function loadConfig() {

    let config = null

    try {

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