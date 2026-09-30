const { ErrorAuthentication, ErrorDomain, ErrorInternServer, ErrorSpecification } = require("../helpers/errorHandler.js")

function loginService(request, response) {

    const { email, password } = request.body

    if (!email || !password) {

        const error = new ErrorSpecification()

        throw error

    }

    const user = {
        accessToken: "String",
        message: "Login exitoso",
        data: {
            idUser: "Number",
            name: "String",
            surname: "String",
            role: "String",
            temporaryPassword: "Boolean"
        }
    }

    return user

}

function logoutService(request, response) {


}



module.exports = { loginService, logoutService }