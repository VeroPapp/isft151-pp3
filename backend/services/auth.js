const { ErrorAuthentication, ErrorDomain, ErrorInternServer, ErrorSpecification } = require("../helpers/errorHandler.js")
const { authenticate } = require("../models/auth.js")
const { getStatusById } = require("../models/status.js")
const { getRoleById } = require("../models/roles.js")
const { listSessions, UserSession, sessionsByUsers } = require("./session.js")
const { validateSession, validateRole } = require("../middlewares/auth.js")

async function login(request, response) {

    let body = ""

    request.on("data", chunk => {
        body += chunk.toString()
    })

    request.on("end", async () => {
        try {            
            if (!body) {
                const error = new ErrorSpecification()
                throw error
            }

            // * se valida que el body no sea "" anteriormente, porq si lo convierto a JSON.parse("") me lanza un error inmediatamente. 500
            request.body = JSON.parse(body)

            const { email, password } = request.body
            if (!email || !password) {
                const err = new ErrorSpecification();
                throw err
            }

            const usersExists = authenticate(email, password)

            if (!usersExists) {
                const error = new ErrorAuthentication()
                throw error
            }

            const statusExists = getStatusById(usersExists.idStatus)
            if (!statusExists || statusExists.name === "PENDING" || statusExists.name === "REJECTED" || statusExists.name === "INACTIVE") {
                const error = new ErrorDomain()
                error.setMessage("El usuario no esta habilitado para iniciar sesion. Debe estar habilitado por el administrador.")
                throw error
            }

            const roleExists = getRoleById(usersExists.idRole)
            if (!roleExists) {
                const error = new ErrorDomain()
                error.setMessage("El usuario no tiene un rol válido para iniciar sesión. Contacte al administrador.")
                throw error
            }

            const user = {
                idUser: usersExists.idUser,
                name: usersExists.name,
                surname: usersExists.surname,
                role: roleExists.name,
                temporaryPassword: Boolean(usersExists.temporaryPassword)
            }

            let currentSession = null
            // * si existe el token asociado al usuario
            const existingToken = sessionsByUsers.get(email)
            if (existingToken) {
                // * devolveme el objeto sesion asociado al token
                currentSession = listSessions.get(existingToken)
            }

            if (!currentSession) {
                currentSession = new UserSession();
                const currentToken = await currentSession.setHash(usersExists.idUser, email)
                currentSession.setRole(roleExists.name)
                currentSession.setStatus('enabled');

                sessionsByUsers.set(email, currentToken);
                listSessions.set(currentToken, currentSession)

                console.log(currentSession);

            }

            if (usersExists.temporaryPassword === 1) {
                response.writeHead(200, {
                    "Content-Type": "application/json",
                    "x-accessToken": `${currentSession.getHash()}`
                })
                response.end(JSON.stringify({ message: "Contraseña temporal utilizada, redirección a cambio de contraseña", redirectToChangePassword: true, user }))
                return
            }

            currentSession.setStatus("enabled")

            console.log(currentSession);

            response.writeHead(200, {
                "Content-Type": "application/json",
                "x-accessToken": `${currentSession.getHash()}`
            })
            response.end(JSON.stringify(user))


        } catch (error) {

            const type = error.type || "ErrorInternServer"
            let message = null
            let code = null

            switch (type) {
                case "ErrorAuthentication":
                    message = error.getMessage()
                    code = error.getCode()
                    break;
                case "ErrorSpecification":
                    message = error.getMessage()
                    code = error.getCode()
                    break;
                case "ErrorDomain":
                    message = error.getMessage()
                    code = error.getCode()
                    break;
                case "ErrorInternServer":
                    message = error.message
                    code = 500
                    break;
            }

            response.writeHead(code, { "Content-Type": "application/json" })
            response.end(JSON.stringify(message))
        }
    })

}

function logout(request, response) {

    try {
        const ok = validateSession(request, response)
        if (!ok) {
            return
        }
        const okRole = validateRole(request, response, ["MEMBER", "CLUB_ADMIN", "SUPER_ADMIN"])
        if (!okRole) {
            return
        }

        const { role, currentSession } = request.body

        currentSession.setStatus("disabled")
        console.log(currentSession);
        sessionsByUsers.delete(currentSession.getEmail())
        listSessions.delete(currentSession.getHash())
        // listSessions.delete(currentSession.getHash())

        response.writeHead(200, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "Sesión cerrada correctamente" }))

    } catch (error) {

        const type = error.type || "ErrorInternServer"
        let message = null
        let code = null

        switch (type) {
            case "ErrorAuthentication":
                message = error.getMessage()
                code = error.getCode()
                break;
            case "ErrorSpecification":
                message = error.getMessage()
                code = error.getCode()
                break;
            case "ErrorDomain":
                message = error.getMessage()
                code = error.getCode()
                break;
            case "ErrorInternServer":
                message = error.message
                code = 500
                break;
        }

        response.writeHead(code, { "Content-Type": "application/json" })
        response.end(JSON.stringify(message))
    }



}

module.exports = { login, logout }