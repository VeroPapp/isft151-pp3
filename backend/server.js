const { createServer } = require("node:http");
const { URL } = require("node:url");
const instanceConfig = require("./config/config.js");
const { InstanceRouter } = require("./router/router.js");
const { sessionAuthorized } = require("./middlewares/auth.js")
const { sendError, BadRequestError, UnauthorizedError } = require("./helpers/errorHandler.js");

const base = `http://localhost:${instanceConfig.server.port}`;

async function requestDispatcher(request, response) {

    response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-access-token");
    // *le indica al navegador que el cliente puede leer estos headers de la respuesta
    response.setHeader("Access-Control-Expose-Headers", "x-access-token");

    const url = new URL(request.url, base);
    console.log("protocolo + dominio + endpoint completo: " + url);

    const path = url.pathname;
    console.log("path + endpoint de la peticion: " + path);

    try {

        // Responder preflight OPTIONS
        if (request.method === "OPTIONS") {
            response.writeHead(204);
            response.end();
            return;
        }

        const handler = InstanceRouter.get(path);
        if (!handler) {
            throw new BadRequestError("Método o endpoint no encontrado.");
        }

        const sessionKey = request.headers["x-access-token"];
        console.log("sessionKey recibida: ", sessionKey);

        // 1. Valida su sesión y su autorización (Ahora es una promesa real)
        const session = await sessionAuthorized(sessionKey, path);

        // 2. Si no está autorizado lanza el error
        if (!session.isAuthorized) {
            throw new UnauthorizedError("Usted no puede realizar dicha acción privada porque requiere de un token de sesión válido o no tiene los permisos requeridos.");
        }

        // 3. Si está autorizado e identificamos al usuario, inyectamos la sesión
        if (session.IDuser !== null) {
            request.user = session;
        } else {
            request.user = null; // Limpieza para rutas públicas
        }

        // 4. Ejecuta el controlador de destino
        return await handler.method(request, response);

    } catch (error) {
        console.error("DETALLE DEL ERROR CAPTURADO EN SERVER:", error);
        sendError(response, error);
    }
}

const serverObject = createServer(requestDispatcher);

function init() {
    console.log(`Servidor ejecutandose en ${base}`);
}

serverObject.listen(instanceConfig.server.port, init);