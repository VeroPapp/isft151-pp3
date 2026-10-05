const { listSessions, UserSession } = require("../services/session.js")
const { ErrorAuthentication, ErrorDomain, ErrorInternServer, ErrorSpecification } = require("../helpers/errorHandler.js")

function validateSession(request, response) {
    const currentToken = request.headers["x-access-token"]
    const currentSessionObject = listSessions.get(currentToken)

    if (!currentSessionObject || currentSessionObject.getStatus() === "disabled") {
        const error = new ErrorAuthentication()
        error.setMessage("No se encuentra su sesion o esta inactiva, debe loguearse de vuelta")
        throw error
    }

    const role = currentSessionObject.getRole()
    request.body = { role: role, currentSession: currentSessionObject }

    return true


}


function validateRole(request, response, listRoles) {

    const { role } = request.body || {}

    if (!listRoles.includes(role)) {
        const error = new ErrorAuthentication()
        error.setMessage("No autorizado para ejecutar ese endpoint")
        throw error
    }

    return true

}


module.exports = { validateSession, validateRole }