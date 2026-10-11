const { sendSuccess } = require("../helpers/responseHandler.js");
const { InternServerError, BadRequestError, UnauthorizedError, DomainError, sendError } = require("../helpers/errorHandler.js");
const { authenticate } = require("../models/auth.js");
const { getStatusById } = require("../models/status.js");
const { getRoleById } = require("../models/roles.js");
const { updateSessionKeyByID } = require("../models/user.js");
const { UserSession } = require("../services/session.js");

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

            const data = JSON.parse(bodyRaw);
            const { email, password } = data;

            if (!email || !password || !password.trim()) {
                throw new BadRequestError("El email y la contraseña son requeridos.");
            }
            // * 1. Autenticación si es quien dice ser.
            const usersExists = authenticate(email, password);
            if (!usersExists) {
                throw new UnauthorizedError("Credenciales inválidas o usuario no encontrado.");
            }

            // * 2. Obtener el nombre del rol
            const roleExists = getRoleById(usersExists.idRole);
            if (!roleExists) {
                throw new UnauthorizedError("El usuario no tiene un rol válido para iniciar sesión.");
            }

            // * 3. Validación del Estado del Usuario
            const statusExists = getStatusById(usersExists.idStatus);
            if (!statusExists || statusExists.nameStatus === "PENDINGFORAPPROBATION" || statusExists.nameStatus === "REJECTED" || statusExists.nameStatus === "INACTIVE" || statusExists.nameStatus === "NONE") {
                throw new UnauthorizedError("El usuario no está habilitado para iniciar sesión (Pendiente, rechazado o inactivo).");
            }

            // * Mapeo básico del usuario para la respuesta
            const user = {
                idUser: usersExists.idUser,
                name: usersExists.name,
                surname: usersExists.surname,
                role: roleExists.nameRole,
            };

            // * Si no tiene sesión ("NONE"), generamos una nueva y actualizamos la base de datos
            let currentToken = usersExists.sessionKey;
            if (usersExists.sessionKey === "NONE") {
                const currentSession = new UserSession();
                currentSession.setHash(usersExists.idUser, email);
                currentToken = currentSession.getHash()
                updateSessionKeyByID(currentToken, usersExists.idUser);
            }

            // * Inyectamos SIEMPRE el token en la cabecera
            response.setHeader("x-access-token", `${currentToken}`);

            // * 4. Control del flujo para cambiar obligatoriamente la contraseña
            if (statusExists.nameStatus === "PENDINGFORPASSWORDCHANGE") {
                const result = {
                    message: "Contraseña temporal utilizada, redirección a cambio de contraseña",
                    redirectToChangePassword: true,
                    user: user
                };
                sendSuccess(response, result, 200);
                return
            }

            // * Si es ACTIVE, mandamos el objeto completo estructurado
            const result = {
                message: "Login exitoso",
                user: user
            };

            sendSuccess(response, result, 200);

        } catch (error) {
            sendError(response, error);
        }
    });
}

function logout(request, response) {

    try {

        const { IDuser, IDrole, IDstatus } = request.body
        const updateSession = updateSessionKeyByID('NONE', IDuser)
        if (!updateSession) {
            const error = new UnauthorizedError("El usuario no existe o no se pudo cerrar la sesión.")
            throw error
        }

        sendSuccess(response, { message: "Sesión cerrada correctamente" }, 200);

    } catch (error) {

        sendError(response, error)
    }
}

module.exports = { login, logout };
