const { listSessions, UserSession } = require("../services/session.js")
const { InternServerError, BadRequestError, UnauthorizedError, DomainError, sendError } = require("../helpers/errorHandler.js");
const { getUserBySessionKey } = require("../models/user.js")
const { getRoleById } = require("../models/roles.js")
const { getStatusById } = require("../models/status.js")

function validateSession(sessionKey) {

    try {
        const sessionExists = getUserBySessionKey(sessionKey)

        if (!sessionExists) {
            return false
        }

        return { IDrole: sessionExists.IDrole, IDuser: sessionExists.IDuser, IDstatus: sessionExists.IDstatus }

    } catch (error) {
        throw error
    }


}


function authorize(IDstatus, IDrole, allowedRoles) {

    try {

        const statusExists = getStatusById(IDstatus)
        if (!statusExists || statusExists.nameStatus === "REJECTED" || statusExists.nameStatus === "INACTIVE" || statusExists.nameStatus === "PENDINGFORAPPROBATION") {
            return false
        }

        const roleExists = getRoleById(IDrole)
        if (!roleExists || !allowedRoles.includes(roleExists.nameRole)) {
            return false
        }

        return { nameRole: roleExists.nameRole }

    } catch (error) {
        throw error
    }

}


module.exports = { validateSession, authorize }