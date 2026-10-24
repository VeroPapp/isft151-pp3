const { sendSuccess } = require("../helpers/responseHandler.js");
const { BadRequestError, UnauthorizedError, DomainError, sendError } = require("../helpers/errorHandler.js");

const { authenticateDB } = require("../models/auth.js");
const { getStatusByIdDB } = require("../models/status.js");
const { getRoleByIdDB } = require("../models/roles.js");
const { updateSessionKeyByIdDB, getUserByIdDB, updatePasswordStatusSessionByIdDB } = require("../models/user.js");

const { UserSession } = require("../services/session.js");
const { validateChangePassword } = require("../helpers/validateChangePassword.js");
const { calcularHashSHA256 } = require("../helpers/hash.js");



function login(request, response) {
    let bodyRaw = "";

    request.on('data', chunk => {
        bodyRaw += chunk.toString();
    });

    request.on("end", async function () {
        try {

            let data;
            try {
                data = JSON.parse(bodyRaw);
            } catch (error) {
                throw new BadRequestError("El cuerpo de la petición debe contener un JSON válido.");
            }

            const { email, password } = data;

            if (!email || !password || !password.trim() || !email.trim()) {
                throw new BadRequestError("El email y la contraseña son requeridos.");
            }

            // 1. Autenticación
            const userExists = authenticateDB(email, password);
            if (!userExists) {
                throw new UnauthorizedError("Credenciales inválidas.");
            }

            // 2. Obtener el nombre del rol
            const roleExists = getRoleByIdDB(userExists.idRole);
            if (!roleExists) {
                throw new UnauthorizedError("El usuario no tiene un rol válido para iniciar sesión.");
            }

            // 3. Validación del Estado del Usuario
            const statusExists = getStatusByIdDB(userExists.idStatus);
            const invalidStatuses = ["PENDINGFORAPPROBATION", "REJECTED", "INACTIVE", "NONE"];

            if (!statusExists || invalidStatuses.includes(statusExists.nameStatus)) {
                throw new UnauthorizedError("El usuario no está habilitado para iniciar sesión.");
            }

            // Mapeo estructurado del usuario
            const userPayload = {
                idUser: userExists.idUser,
                name: userExists.name,
                surname: userExists.surname,
                role: roleExists.nameRole,
            };

            // Gestión de la sesión (Token)
            let currentToken = userExists.sessionKey;
            if (currentToken === "NONE") {
                const currentSession = new UserSession();
                currentSession.setHash(userExists.idUser, email);
                currentToken = currentSession.getHash();
                updateSessionKeyByIdDB(currentToken, userExists.idUser);
            }

            // Inyectamos SIEMPRE el token en la cabecera
            response.setHeader("x-access-token", `${currentToken}`);

            // 4. Control del flujo para cambio obligatorio de contraseña
            if (statusExists.nameStatus === "PENDINGFORPASSWORDCHANGE") {
                return sendSuccess(response, {
                    message: "Contraseña temporal utilizada, redirección a cambio de contraseña",
                    redirectToChangePassword: true,
                    user: userPayload
                }, 200);
            }

            // Login exitoso estándar
            sendSuccess(response, {
                message: "Login exitoso",
                user: userPayload
            }, 200);

        } catch (error) {
            sendError(response, error);
        }
    });
}

function logout(request, response) {
    try {
        const idUser = request.user.IDuser
        if (!idUser) {
            throw new BadRequestError("No se pudo identificar al usuario en la sesión.");
        }

        const updateSession = updateSessionKeyByIdDB('NONE', idUser);
        if (!updateSession) {
            throw new UnauthorizedError("El usuario no existe o no se pudo cerrar la sesión.");
        }

        sendSuccess(response, { message: "Sesión cerrada correctamente" }, 200);
    } catch (error) {
        sendError(response, error);
    }
}

function changePassword(request, response) {
    let bodyRaw = "";

    request.on("data", chunk => {
        bodyRaw += chunk.toString();
    });

    request.on("end", function () {
        try {
            const idUser = request.user.IDuser;

            let data;
            try {
                data = JSON.parse(bodyRaw);
            } catch (error) {
                throw new BadRequestError("El cuerpo de la petición debe contener un JSON válido.");
            }

            const { currentPassword, newPassword, confirmPassword } = data;

            if (!currentPassword || !newPassword || !confirmPassword || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
                throw new BadRequestError("Todos los campos deben ser textos y son obligatorios.");
            }

            if (newPassword !== confirmPassword) {
                throw new BadRequestError("La nueva contraseña y la confirmación no coinciden.");
            }

            // Validar fuerza de la contraseña
            if (!validateChangePassword(newPassword)) {
                throw new BadRequestError("La contraseña debe tener al menos 8 caracteres e incluir una letra mayúscula, una letra minúscula, un número y un carácter especial.");
            }

            const userExists = getUserByIdDB(idUser);
            if (!userExists) {
                throw new UnauthorizedError("El usuario no está registrado en la base de datos.");
            }

            // Verificar contraseña actual
            const currentPasswordHash = calcularHashSHA256(currentPassword);
            if (userExists.password !== currentPasswordHash) {
                throw new BadRequestError("La contraseña actual ingresada es incorrecta.");
            }

            // Validar que la nueva contraseña no sea igual a datos sensibles o a la anterior
            const newPasswordHash = calcularHashSHA256(newPassword);
            if (userExists.dni == newPassword || userExists.email == newPassword) {
                throw new BadRequestError("La contraseña no puede ser igual a tu DNI o Email.");
            }
            if (userExists.password === newPasswordHash) {
                throw new BadRequestError("La nueva contraseña no puede ser igual a la anterior.");
            }

            // Actualizar contraseña, estado y sesión en una sola consulta
            const updateUser = updatePasswordStatusSessionByIdDB(newPasswordHash, 3, "NONE", idUser);
            if (!updateUser) {
                throw new DomainError("No se pudo actualizar la información del usuario en el sistema.");
            }

            sendSuccess(response, { message: "La contraseña ha sido modificada con éxito." }, 200);

        } catch (error) {
            sendError(response, error);
        }
    });
}

module.exports = { login, logout, changePassword };
