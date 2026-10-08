const { sendSuccess } = require("../helpers/responseHandler.js");
const { InternServerError, BadRequestError, UnauthorizedError, DomainError, sendError } = require("../helpers/errorHandler.js");
const { authenticate } = require("../models/auth.js");
const { getStatusById } = require("../models/status.js");
const { getRoleById } = require("../models/roles.js");
const { listSessions, UserSession, sessionsByUsers } = require("./session.js");
const { validateSession, validateRole } = require("../middlewares/auth.js");

function login(request, response) {

    let bodyRaw = "";

    request.on('data', chunk => {
        bodyRaw += chunk.toString();
    });

    request.on("end", function () {

        try {

            if (!bodyRaw) {
                throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
            }

            const body = JSON.parse(bodyRaw);
            const { email, password } = body;

            if (!email || !password || !password.trim()) {
                throw new BadRequestError("El email y la contraseña son requeridos.");
            }

            // ---- 1 - VALIDA QUE EL USUARIO EXISTA Y QUE LA CONTRASEÑA SEA CORRECTA ----
            const usersExists = authenticate(email, password);

            if (!usersExists) {
                throw new UnauthorizedError("Credenciales inválidas o usuario no encontrado.");
            }

            // ---- 2 - VALIDA QUE EL USUARIO TENGA UN ESTADO ACTIVO PARA INICIAR SESIÓN ----
            const statusExists = getStatusById(usersExists.idStatus);

            if (!statusExists || statusExists.name === "PENDING" || statusExists.name === "REJECTED" || statusExists.name === "INACTIVE") {
                throw new UnauthorizedError("El usuario no esta habilitado para iniciar sesion. Debe estar habilitado por el administrador.");
            }

            // ---- 3 - VALIDA QUE EL USUARIO TENGA UN ROL ASIGNADO PARA INICIAR SESIÓN ----
            const roleExists = getRoleById(usersExists.idRole);

            if (!roleExists) {
                throw new UnauthorizedError("El usuario no tiene un rol válido para iniciar sesión. Contacte al administrador.");
            }

            const user = {
                idUser: usersExists.idUser,
                name: usersExists.name,
                surname: usersExists.surname,
                role: roleExists.name,
                temporaryPassword: Boolean(usersExists.temporaryPassword)
            };

            // ---- 4 - GESTIÓN DE SESIÓN Y TOKENS ----
            let currentSession = null;
            const existingToken = sessionsByUsers.get(email);

            if (existingToken) {
                currentSession = listSessions.get(existingToken);
            }

            if (!currentSession) {
                currentSession = new UserSession();
                const currentToken = currentSession.setHash(usersExists.idUser, email);
                currentSession.setRole(roleExists.name);
                currentSession.setStatus("enabled");

                sessionsByUsers.set(email, currentToken);
                listSessions.set(currentToken, currentSession);
            } else {
                currentSession.setStatus("enabled");
            }

            response.setHeader("x-access-token", `${currentSession.getHash()}`);

            // Si el usuario tiene contraseña temporal, redirigimos
            if (usersExists.temporaryPassword === 1 || usersExists.temporaryPassword === true) {
                const resultTemporal = {
                    message: "Contraseña temporal utilizada, redirección a cambio de contraseña",
                    redirectToChangePassword: true,
                    user: user
                };
                sendSuccess(response, resultTemporal, 200);
                return
            }

            // Respuesta exitosa estándar
            const result = {
                user: user
            };

            sendSuccess(response, result, 200);

        } catch (error) {

            sendError(response, error)

        }


    })

}

function logout(request, response) {

    try {

        const ok = validateSession(request, response);
        if (!ok) {
            const error = new UnauthorizedError("No se encuentra su sesion o esta inactiva, debe loguearse de vuelta")
            throw error
        }

        const okRole = validateRole(request, response, ["MEMBER", "CLUB_ADMIN", "SUPER_ADMIN"]);
        if (!okRole) {
            throw new UnauthorizedError("No tienes permisos suficientes para realizar esta acción.");
        }

        const { currentSession } = request.body;


        currentSession.setStatus("disabled");
        sessionsByUsers.delete(currentSession.getEmail());
        listSessions.delete(currentSession.getHash());

        sendSuccess(response, { message: "Sesión cerrada correctamente" }, 200);

    } catch (error) {

        sendError(response, error)
    }
}

module.exports = { login, logout };