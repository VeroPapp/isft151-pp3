const { InstanceRouter } = require("../router/router.js");
const { getMemberBySessionKeyDB } = require("../models/member.js");
const { getRoleByIdDB } = require("../models/roles.js");
const { getStatusByIdDB } = require("../models/status.js");

async function sessionAuthorized(sessionKey, endpoint) {
    const handler = InstanceRouter.get(endpoint);

    if (!handler) {
        return { isAuthorized: false, idUser: null, IDrole: null, IDstatus: null };
    }

    if (handler.status === "public") {
        return { isAuthorized: true, idUser: null, IDrole: null, IDstatus: null };
    }

    if (!sessionKey) {
        return { isAuthorized: false, idUser: null, IDrole: null, IDstatus: null };
    }

    const user = getMemberBySessionKeyDB(sessionKey);
    if (!user) {
        return { isAuthorized: false, idUser: null, IDrole: null, IDstatus: null };
    }

    const role = getRoleByIdDB(user.IDrole);
    const status = getStatusByIdDB(user.IDstatus);

    if (!role || !status) {
        return { isAuthorized: false, idUser: null, IDrole: null, IDstatus: null };
    }

    if (!handler.allowedStatuses || !handler.allowedStatuses.includes(status.nameStatus)) {
        return { isAuthorized: false, idUser: null, IDrole: null, IDstatus: null };
    }

    if (!handler.roles || !handler.roles.includes(role.nameRole)) {
        return { isAuthorized: false, idUser: null, IDrole: null, IDstatus: null };
    }

    return {
        isAuthorized: true, idUser: user.idUser, IDrole: user.IDrole, IDstatus: user.IDstatus
    };
}

module.exports = { sessionAuthorized };
