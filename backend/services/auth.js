const { ErrorAuthentication, ErrorDomain, ErrorInternServer, ErrorSpecification } = require("../helpers/errorHandler.js")

const { authenticate } = require("../models/auth.js")

const { calcularHashSHA256 } = require("../helpers/hash.js")



// * POR AHORA ACA..... LUEGO MODULARIZARRRRRR
const listSessions = new Map();  //clave-valor  -> clave: email,  valor: sessionObj

class UserSession {
    constructor() {
        this.status = 'disabled';
        this.hash = null
    }

    setData(idUser, email){
        let cadena = idUser + email
        const result = calcularHashSHA256(cadena)
        this.hash = result
    }

    getData() {
        return this.hash
    }

    setStatus(status) {
        this.status = status
    }

    getStatus() {
        return this.status
    }

}

function login(request, response) {

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

            // * se valida que el body no sea "" anteriormente, porq si lo convierto a JSON.parse("") me lanza un error inmediatamente.
            request.body = JSON.parse(body)

            console.log(request.body);

            const { email, password } = request.body

            // * ------------------- DUDA VA ACA O EN MODELS?????-------------------------------------
            if (!email || !password) {
                const err = new ErrorSpecification();
                throw err
            }

            let isAuthenticated = null
            let user = null

            // * ----------------------------------------
            isAuthenticated = authenticate(email, password)

            if (isAuthenticated) {

                if (!havePreviousSession) {
                    const newSession = new UserSession();
                    newSession.setData(isAuthenticated.idUser, email)
                    newSession.setStatus('enabled');

                    listSessions.set(email, newSession);
                    
                    user = {
                        "idUser": isAuthenticated.idUser,
                        "name": isAuthenticated.name,
                        "surname": isAuthenticated.surname,
                        "role": isAuthenticated.role,
                        "temporaryPassword": isAuthenticated.temporaryPassword
                    }

                }

                // if()
                // ..................

            }

            response.writeHead(200, { "Content-Type": "application/json" })
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