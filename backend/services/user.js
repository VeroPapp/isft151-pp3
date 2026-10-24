const { sendSuccess } = require("../helpers/responseHandler.js");
const { sendError, BadRequestError, UnauthorizedError } = require("../helpers/errorHandler.js");
const { getUserByIdDB, listMembersDB } = require("../models/user.js");
const { getRoleByIdDB } = require("../models/roles.js");


function getUserProfile(request, response) {
    try {
        const IDuser = request.user?.IDuser;
        if (!IDuser) {
            throw new UnauthorizedError("No se pudo identificar al usuario en la sesión.");
        }

        const user = getUserByIdDB(IDuser);
        if (!user) {
            throw new BadRequestError("Usuario no encontrado.");
        }

        const role = getRoleByIdDB(request.user.IDrole);

        if (!role) {
            throw new UnauthorizedError("No se pudo identificar el rol del usuario.");
        }

        // Excluir campos sensibles
        const { password, sessionKey, ...profile } = user;
        profile.role = role.nameRole;

        sendSuccess(response, { profile }, 200);

    } catch (error) {
        sendError(response, error);
    }
}

function listMembers(request, response) {
    try {
        const members = listMembersDB();

        if (members.length === 0) {
            sendSuccess(response, {
                message: "No hay miembros registrados todavía.",
                members: []
            }, 200);
            return;
        }

        sendSuccess(response, { members }, 200);
    } catch (error) {
        sendError(response, error);
    }
}

module.exports = { getUserProfile, listMembers };