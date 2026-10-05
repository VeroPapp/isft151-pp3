const { sendSuccess } = require("../helpers/responseHandler.js");
const { BadRequestError, UnauthorizedError, ForbiddenError } = require("../helpers/errorHandler.js");
const { authenticate } = require("../models/auth.js");
const { getStatusById } = require("../models/status.js");
const { getRoleById } = require("../models/roles.js");
const { listSessions, UserSession, sessionsByUsers } = require("./session.js");
const { validateSession, validateRole } = require("../middlewares/auth.js");

async function login(request, response) {
    // 1. LEER EL STREAM DE LA PETICIÓN POST
    let bodyRaw = "";
    for await (const chunk of request) {
        bodyRaw += chunk;
    }

    if (!bodyRaw) {
        throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
    }

    const body = JSON.parse(bodyRaw);
    const { email, password } = body;

    if (!email || !password) {
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
        throw new ForbiddenError("El usuario no esta habilitado para iniciar sesion. Debe estar habilitado por el administrador.");
    }

    // ---- 3 - VALIDA QUE EL USUARIO TENGA UN ROL ASIGNADO PARA INICIAR SESIÓN ----
    const roleExists = getRoleById(usersExists.idRole);

    if (!roleExists) {
        throw new ForbiddenError("El usuario no tiene un rol válido para iniciar sesión. Contacte al administrador.");
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
        const currentToken = await currentSession.setHash(usersExists.idUser, email);
        currentSession.setRole(roleExists.name);
        currentSession.setStatus("enabled");

        sessionsByUsers.set(email, currentToken);
        listSessions.set(currentToken, currentSession);
    } else {
        currentSession.setStatus("enabled");
    }

    // Adjuntamos la cabecera del token a la respuesta HTTP
    response.setHeader("x-accessToken", `${currentSession.getHash()}`);

    // Si el usuario tiene contraseña temporal, redirigimos
    if (usersExists.temporaryPassword === 1 || usersExists.temporaryPassword === true) {
        const resultTemporal = {
            message: "Contraseña temporal utilizada, redirección a cambio de contraseña",
            redirectToChangePassword: true,
            user: user,
            accessToken: currentSession.getHash()
        };
        return sendSuccess(response, resultTemporal, 200);
    }

    // Respuesta exitosa estándar
    const result = {
        user: user,
        accessToken: currentSession.getHash()
    };

    sendSuccess(response, result, 200);
}

function logout(request, response) {
    const ok = validateSession(request, response);
    if (!ok) {
        throw new UnauthorizedError("Sesión inválida o no encontrada.");
    }

    const okRole = validateRole(request, response, ["MEMBER", "CLUB_ADMIN", "SUPER_ADMIN"]);
    if (!okRole) {
        throw new ForbiddenError("No tienes permisos suficientes para realizar esta acción.");
    }

    const { currentSession } = request.body;

    if (currentSession) {
        currentSession.setStatus("disabled");
        sessionsByUsers.delete(currentSession.getEmail());
        listSessions.delete(currentSession.getHash());
    }

    sendSuccess(response, { message: "Sesión cerrada correctamente" }, 200);
}

module.exports = { login, logout };