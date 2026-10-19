// * Error interno del servidor
class InternServerError {
    constructor(message = "Error interno del servidor") {
        this.code = 500;
        this.message = message;
        this.type = "ErrorInternServer";
    }

    getMessage() {
        return this.message;
    }

    getType() {
        return this.type;
    }

    getCode() {
        return this.code;
    }
}

// * Error de peticion invalida o especificacion
class BadRequestError {
    constructor(message = "Petición incorrecta") {
        this.code = 400;
        this.message = message;
        this.type = "BadRequestError";
    }

    getMessage() {
        return this.message;
    }

    getType() {
        return this.type;
    }

    getCode() {
        return this.code;
    }
}

// * Error no autenticado o sin permisos 
class UnauthorizedError {
    constructor(message = "No autenticado o sin permisos") {
        this.code = 401;
        this.message = message;
        this.type = "UnauthorizedError";
    }

    getMessage() {
        return this.message;
    }

    getType() {
        return this.type;
    }

    getCode() {
        return this.code;
    }
}

//* Error Dominio
class DomainError {
    constructor(message = "La operación no cumple con las reglas del negocio") {
        this.code = 422;
        this.message = message;
        this.type = "DomainValidationError";
    }

    getMessage() { return this.message; }
    getType() { return this.type; }
    getCode() { return this.code; }

}


function sendError(response, error) {
    let codeStatus = null;
    let message = null
    let type = null


    switch (error.type) {
        case "UnauthorizedError":
            codeStatus = error.getCode();
            message = error.getMessage();
            type = error.getType()
            break;

        case "BadRequestError":
            codeStatus = error.getCode();
            message = error.getMessage();
            type = error.getType()
            break;

        case "DomainValidationError":
            codeStatus = error.getCode();
            message = error.getMessage();
            type = error.getType()
            break;

        case "ErrorInternServer":
            codeStatus = error.getCode();
            message = error.getMessage();
            type = error.getType()
            break;

        default:
            codeStatus = 500
            message = "Error interno del servidor" || error.message;
            type = "ErrorInternServer"
            break;
    }



    const data = {
        error: {
            type: type,
            message: message
        }
    }

    response.writeHead(codeStatus, { "Content-Type": "application/json" });
    response.end(JSON.stringify(data));
}

module.exports = {
    InternServerError,
    BadRequestError,
    UnauthorizedError,
    DomainError,
    sendError
};