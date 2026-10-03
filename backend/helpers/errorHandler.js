// * HTTP 401
class ErrorAuthentication {
    constructor() {
        this.message = { exception: "AUTENTICACION_REQUERIDA", detail: ["Faltan credenciales de autenticacion"] }
        this.type = "ErrorAuthentication"
        this.code = 401
    }

    getMessage() {
        return this.message
    }

    getType() {
        return this.type
    }

    getCode() {
        return this.code
    }
}

// * HTTP 400
class ErrorSpecification {
    constructor() {
        this.message = { exception: "ESPECIFICACION_INVALIDA", detail: ["La especificación proporcionada es inválida"] }
        this.type = "ErrorSpecification"
        this.code = 400
    }

    getMessage() {
        return this.message
    }
    getType() {
        return this.type
    }
    getCode() {
        return this.code
    }
}

// * HTTP 422
class ErrorDomain {
    constructor() {
        this.message = {
            exception: "REGLA_NEGOCIO_VIOLADA",
            detail: ["La operación no cumple con las reglas del sistema"]
        }
        this.type = "ErrorDomain"
        this.code = 422

    }

    getMessage() {
        return this.message
    }

    getType() {
        return this.type
    }

    getCode() {
        return this.code
    }
    
    setMessage(message) {
        this.message.detail.push(message)
    }
}

// * HTTP 500
class ErrorInternServer {
    constructor() {
        this.message = { exception: "ERROR_INTERNO_SERVIDOR", detail: ["Ocurrió un error interno en el servidor"] }
        this.type = "ErrorInternServer"
        this.code = 500
    }

    getMessage() {
        return this.message
    }

    getType() {
        return this.type
    }

    getCode() {
        return this.code
    }
}


module.exports = { ErrorAuthentication, ErrorDomain, ErrorInternServer, ErrorSpecification }