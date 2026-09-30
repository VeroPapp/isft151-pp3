const { createServer } = require("node:http")
const { URL } = require("node:url")
const instanceConfig = require("../backend/config/config.js")
const { InstanceRouterAuth } = require("../backend/routers/auth.js");

const base = `http://localhost:${instanceConfig.server.port}`

async function requestDispatcher(request, response) {

    const url = new URL(request.url, base);
    console.log("protocolo + dominio + puerto completo: " + url)

    const path = url.pathname;
    console.log("path + endpoint de la peticion: " + path);
    const handler = InstanceRouterAuth.get(path);

    if (handler) {
        return await handler(request, response);
    } else {
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify('Método no encontrado'));
    }
}

const serverObject = createServer(requestDispatcher)

function init() {

    console.log(`Servidor ejecutandose en ${base}`);
}

serverObject.listen(instanceConfig.server.port, init)