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

            // ---- 1 - VALIDA QUE EL USUARIO EXISTA Y QUE LA CONTRASEÑA SEA CORRECTA ----
            const usersExists = authenticate(email, password)

            if (!usersExists) {
                const error = new ErrorAuthentication()
                throw error
            }


            // ---- 2 - VALIDA QUE EL USUARIO TENGA UN ESTADO ACTIVO PARA INICIAR SESION ----
            const statusExists = getStatusById(usersExists.idStatus)

            if (!statusExists || statusExists.name === "PENDING" || statusExists.name === "REJECTED" || statusExists.name === "INACTIVE") {
                const error = new ErrorDomain()
                error.setMessage("El usuario no tiene un estado válido para iniciar sesión. Es necesario que este habilitado para poder iniciar sesión.")
                throw error
            }


            // ---- 3- VALIDA QUE EL USUARIO TENGA UN ROL ASIGNADO PARA INICIAR SESION ----
            const roleExists = getRoleById(usersExists.idRole)

            if (!roleExists) {
                const error = new ErrorDomain()
                error.setMessage("El usuario no tiene un rol válido para iniciar sesión. Es necesario que este habilitado para poder iniciar sesión.")
                throw error
            }


            //no deberia tirar error, deberia dejarlo loguear pero redireccionar a la pantalla de cambiar contraseña
            //if (usersExists.temporaryPassword === 1) {
            //    const error = new ErrorDomain()
            //    error.setMessage("El usuario debe cambiar la contraseña temporal antes de iniciar sesión.")
            //    throw error
            //}


            const user = {
                idUser: usersExists.idUser,
                name: usersExists.name,
                surname: usersExists.surname,
                role: roleExists.name,
                temporaryPassword: Boolean(usersExists.temporaryPassword)
            }

            // ---- CREA UNA SESION PARA EL USUARIO SI NO EXISTE, O LA HABILITA SI YA EXISTE ----
            let currentSession = listSessions.get(email)

            if (!currentSession) {
                currentSession = new UserSession();
                await currentSession.setHash(usersExists.idUser, email)
                currentSession.setStatus('enabled');

                listSessions.set(email, currentSession);
            }

            currentSession.setStatus("enabled")
            console.log(`Sesión iniciada para el usuario: ${email}. Hash de sesión: ${currentSession.getHash()}`)

            response.writeHead(200, {
                "Content-Type": "application/json",
                "x-accessToken": `${currentSession.getHash()}`
            })

            response.end(JSON.stringify(user));


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


module.exports = { login }