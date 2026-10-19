const { InstanceRouter } = require("../router/router.js");
const { getUserBySessionKey } = require("../models/user.js");
const { getRoleById } = require("../models/roles.js");
const { getStatusById } = require("../models/status.js");

// Definimos la función como async para mantener la consistencia con el await del servidor
async function sessionAuthorized(sessionKey, endpoint) {
    const handler = InstanceRouter.get(endpoint);

    // Si el endpoint no existe en el router, manejamos el caso base
    if (!handler) {
        return { isAuthorized: false, IDuser: null, IDrole: null, IDstatus: null };
    }

    // Flujo Público
    if (handler.status === "public") {
        return { isAuthorized: true, IDuser: null, IDrole: null, IDstatus: null };
    }

    // Flujo Privado - Validar existencia de Token
    if (!sessionKey) {
        return { isAuthorized: false, IDuser: null, IDrole: null, IDstatus: null };
    }

    const user = getUserBySessionKey(sessionKey);
    if (!user) {
        return { isAuthorized: false, IDuser: null, IDrole: null, IDstatus: null };
    }

    const role = getRoleById(user.IDrole);
    const status = getStatusById(user.IDstatus);

    if (!role || !status) {
        return { isAuthorized: false, IDuser: null, IDrole: null, IDstatus: null };
    }

    // * Validar el estado permitido para la ruta
    if (!handler.allowedStatuses || !handler.allowedStatuses.includes(status.nameStatus)) {
        return { isAuthorized: false, IDuser: null, IDrole: null, IDstatus: null };
    }

    // * Validar permisos del Rol en la ruta
    if (!handler.roles || !handler.roles.includes(role.nameRole)) {
        return { isAuthorized: false, IDuser: null, IDrole: null, IDstatus: null };
    }

    return {
        isAuthorized: true, IDuser: user.IDuser, IDrole: user.IDrole, IDstatus: user.IDstatus
    };
}

module.exports = { sessionAuthorized };
