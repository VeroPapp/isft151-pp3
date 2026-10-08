// * Error interno del servidor
class InternServerError {
    constructor(message = "Error interno del servidor") {
        this.name = "ErrorInternServer";
        this.message = message;
        this.statusCode = 500;
    }

    getMessage() {
        return this.message;
    }

    getStatusCode() {
        return this.statusCode;
    }

    getName() {
        return this.name;
    }
}

// * Error de peticion invalida o especificacion
class BadRequestError {
    constructor(message = "Petición incorrecta") {
        this.name = "BadRequestError";
        this.message = message;
        this.statusCode = 400;
    }

    getMessage() {
        return this.message;
    }

    getStatusCode() {
        return this.statusCode;
    }

    getName() {
        return this.name;
    }
}

// * Error no autenticado o sin permisos 
class UnauthorizedError {
    constructor(message = "No autenticado o sin permisos") {
        this.name = "UnauthorizedError";
        this.message = message;
        this.statusCode = 401;
    }

    getMessage() {
        return this.message;
    }

    getStatusCode() {
        return this.statusCode;
    }

    getName() {
        return this.name;
    }
}

//* Error Dominio
class DomainError {
    constructor(message = "La operación no cumple con las reglas del negocio") {
        this.name = "DomainValidationError";
        this.message = message;
        this.statusCode = 422;
    }

    getMessage() { return this.message; }
    getStatusCode() { return this.statusCode; }
    getName() { return this.name; }

}



function sendError(response, error) {
    const statusCode = error.getStatusCode()
    const message = error.getMessage()

    response.writeHead(statusCode, { "Content-Type": "application/json" });

    response.end(JSON.stringify({
        status: "error",
        error: {
            code: statusCode,
            message
        }
    }));
}

module.exports = {
    InternServerError,
    BadRequestError,
    UnauthorizedError,
    DomainError,
    sendError
};