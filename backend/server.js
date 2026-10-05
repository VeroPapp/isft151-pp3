const { createServer } = require("node:http")
const { URL } = require("node:url")
const instanceConfig = require("../backend/config/config.js")
const { InstanceRouter } = require("../backend/router/router.js");

const base = `http://localhost:${instanceConfig.server.port}`

async function requestDispatcher(request, response) {

    // Cabeceras CORS
    response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-access-token"); 
    
    // Responder preflight OPTIONS
    if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
    }

    const url = new URL(request.url, base);
    console.log("protocolo + dominio + endpoint completo: " + url)

    const path = url.pathname;
    console.log("path + endpoint de la peticion: " + path);
    const handler = InstanceRouter.get(path);

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