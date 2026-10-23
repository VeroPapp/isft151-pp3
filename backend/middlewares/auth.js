const { InstanceRouter } = require("../router/router.js");
const { getUserBySessionKeyDB } = require("../models/user.js");
const { getRoleByIdDB } = require("../models/roles.js");
const { getStatusByIdDB } = require("../models/status.js");

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

    const user = getUserBySessionKeyDB(sessionKey);
    if (!user) {
        return { isAuthorized: false, IDuser: null, IDrole: null, IDstatus: null };
    }

    const role = getRoleByIdDB(user.IDrole);
    const status = getStatusByIdDB(user.IDstatus);

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
