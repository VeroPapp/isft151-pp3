const { ErrorAuthentication, ErrorDomain, ErrorInternServer, ErrorSpecification } = require("../helpers/errorHandler.js")
const { authenticate, getUserByEmail } = require("../models/auth.js")
const { getStatusById } = require("../models/status.js")
const { getRoleById } = require("../models/roles.js")
const { listSessions, UserSession } = require("./session.js")

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

            if (usersExists.temporaryPassword === 1) {
                const error = new ErrorDomain()
                error.setMessage("El usuario debe cambiar la contraseña temporal antes de iniciar sesión.")
                throw error
            }

            const statusExists = getStatusById(usersExists.statusId)
            if (!statusExists || statusExists.name === "PENDING" || statusExists.name === "REJECTED") {
                const error = new ErrorDomain()
                error.setMessage("El usuario no tiene un estado válido para iniciar sesión. Es necesario que este habilitado para poder iniciar sesión.")
                throw error
            }

            const roleExists = getRoleById(usersExists.roleId)
            if (!roleExists) {
                const error = new ErrorDomain()
                error.setMessage("El usuario no tiene un rol válido para iniciar sesión. Es necesario que este habilitado para poder iniciar sesión.")
                throw error
            }

            const user = {
                idUser: usersExists.idUser,
                name: usersExists.name,
                surname: usersExists.surname,
                role: roleExists.name,
                temporaryPassword: Boolean(usersExists.temporaryPassword)
            }

            let currentSession = listSessions.get(email)

            if (!currentSession) {
                currentSession = new UserSession();
                await currentSession.setHash(usersExists.id_user, email)
                currentSession.setStatus('enabled');

                listSessions.set(email, currentSession);
            }

            currentSession.setStatus("enabled")

            console.log(user);
            console.log(currentSession.getHash());

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
}

module.exports = { login }