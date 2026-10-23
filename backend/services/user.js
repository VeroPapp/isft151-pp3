const { sendSuccess } = require("../helpers/responseHandler.js");
const { sendError, BadRequestError, UnauthorizedError } = require("../helpers/errorHandler.js");
const { getUserByID } = require("../models/user.js");
const { getRoleById } = require("../models/roles.js");
const { listMembersDB } = require("../models/user.js");


function getUserProfile(request, response) {
    try {
        const IDuser = request.user?.IDuser;
        if (!IDuser) {
            throw new UnauthorizedError("No se pudo identificar al usuario en la sesión.");
        }

        const user = getUserByID(IDuser);
        if (!user) {
            throw new BadRequestError("Usuario no encontrado.");
        }

        const role = getRoleById(request.user.IDrole);

        // Excluir campos sensibles
        const { password, sessionKey, ...profile } = user;
        profile.role = role?.nameRole || "MEMBER";

        sendSuccess(response, { profile }, 200);

    } catch (error) {
        sendError(response, error);
    }
}

function listMembers(request, response) {
    try {
        const members = listMembersDB();

        if (!members || members.length === 0) {
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