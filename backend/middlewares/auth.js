const { listSessions, UserSession } = require("../services/session.js")
const { InternServerError, BadRequestError, UnauthorizedError, DomainError, sendError } = require("../helpers/errorHandler.js");

function validateSession(request, response) {
    const currentToken = request.headers["x-access-token"]
    const currentSessionObject = listSessions.get(currentToken)

    if (!currentSessionObject || currentSessionObject.getStatus() === "disabled") {
        return false
    }

    const role = currentSessionObject.getRole()
    request.body = { role: role, currentSession: currentSessionObject }

    return true

}


function validateRole(request, response, listRoles) {

    const { role } = request.body

    if (!listRoles.includes(role)) {
        return false
    }

    return true

}


module.exports = { validateSession, validateRole }