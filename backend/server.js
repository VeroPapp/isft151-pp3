const { createServer } = require("node:http");
const { URL } = require("node:url");
const instanceConfig = require("./config/config.js");
const { InstanceRouter } = require("./router/router.js");
const { authorize, validateSession } = require("./middlewares/auth.js")
const { sendError, BadRequestError, UnauthorizedError } = require("./helpers/errorHandler.js");

const base = `http://localhost:${instanceConfig.server.port}`;

async function requestDispatcher(request, response) {

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
    console.log("protocolo + dominio + endpoint completo: " + url);

    const path = url.pathname;
    console.log("path + endpoint de la peticion: " + path);

    try {

        const handler = InstanceRouter.get(path);
        if (!handler) {
            throw new BadRequestError("Método o endpoint no encontrado.");
        }

        // * Caso 1: Endpoint Público
        if (handler.status === "public") {
            return await handler.method(request, response);
        }

        // * Caso 2: Endpoint Privado
        const sessionKey = request.headers["x-access-token"]
        console.log("sessionKey ",sessionKey);
        
        if (!sessionKey) {
            const error = new UnauthorizedError("Requiere de un token de session para seguir operando con dicha peticion, acceso privado.")
            throw error
        }

        const ok = await validateSession(sessionKey)
        if (!ok) {
            const error = new UnauthorizedError("No se encuentra su sesion o esta inactiva, debe loguearse de vuelta")
            throw error
        }

        // * ID user/role/status asociado al sessionKey
        const IDrole = ok.IDrole
        const IDUser = ok.IDuser
        const IDstatus = ok.IDstatus
        const allowedRoles = handler.roles

        // * Autorización por roles y frena si es (REJECTED/INACTIVE/PENDINGFORAPROBATION)
        const okRole = authorize(IDstatus, IDrole, allowedRoles)
        if (!okRole) {
            throw new UnauthorizedError("No tienes permisos para realizar esta acción o esta dado de baja del sistema.");
        }

        // * para cualquier endpoint privado (ver perfil, listar actividades, ...) se agrega una pequeña validacion al inicio. Si (request.body.IDstatus === "PENDINGFORPASSWORDCHANGE") lanza un error exigiendo un cambio de contraseña antes de seguir operando.
        request.body = { IDuser: IDUser, IDrole: IDrole, IDstatus: IDstatus }

        return await handler.method(request, response)

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