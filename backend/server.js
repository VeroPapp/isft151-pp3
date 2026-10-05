const { createServer } = require("node:http");
const { URL } = require("node:url");
const instanceConfig = require("./config/config.js");
const { InstanceRouter } = require("./router/router.js");

// Helpers para manejo centralizado y estandarizado de errores
const { sendError, NotFoundError } = require("./helpers/errorHandler.js");

const base = `http://localhost:${instanceConfig.server.port}`;

async function requestDispatcher(request, response) {
    // Cabeceras CORS (Incluyendo x-access-token y x-accessToken)
    response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-access-token");
    response.setHeader("Access-Control-Expose-Headers", "x-accessToken, x-access-token");

    // Responder preflight OPTIONS
    if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
    }

    const url = new URL(request.url, base);
    console.log("protocolo + dominio + endpoint completo: " + url);

    const path = url.pathname;
    console.log("path + endpoint de la peticion: " + path);

    try {
        const handler = InstanceRouter.get(path);

        if (handler) {
            return await handler(request, response);
        } else {
            // Se lanza la excepción NotFoundError (HTTP 404) si la ruta no existe en el Map
            throw new NotFoundError("Método o endpoint no encontrado.");
        }
    } catch (error) {
        console.error("DETALLE DEL ERROR CAPTURADO EN SERVER:", error);
        // Captura centralizada que envía la respuesta formateada en JSON
        sendError(response, error);
    }
}

const serverObject = createServer(requestDispatcher);

function init() {
    console.log(`Servidor ejecutandose en ${base}`);
}

serverObject.listen(instanceConfig.server.port, init);