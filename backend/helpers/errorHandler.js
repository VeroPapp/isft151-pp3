// Clase Base para Errores del Sistema
class ErrorDomain extends Error {
    constructor(message = "Error general del dominio", statusCode = 500) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.type = "ErrorDomain";
    }

    getMessage() {
        return this.message;
    }

    getStatusCode() {
        return this.statusCode;
    }
}

// Subclases de Errores HTTP Específicos
class BadRequestError extends ErrorDomain {
    constructor(message = "Petición incorrecta o datos inválidos") {
        super(message, 400);
        this.type = "ErrorSpecification";
    }
}

class UnauthorizedError extends ErrorDomain {
    constructor(message = "No autorizado o credenciales incorrectas") {
        super(message, 401);
        this.type = "ErrorAuthentication";
    }
}

class ForbiddenError extends ErrorDomain {
    constructor(message = "Acceso prohibido") {
        super(message, 403);
        this.type = "ErrorForbidden";
    }
}

class NotFoundError extends ErrorDomain {
    constructor(message = "Recurso o endpoint no encontrado") {
        super(message, 404);
        this.type = "ErrorNotFound";
    }
}

// Funcion Centralizada para Enviar Respuestas de Error al Cliente
function sendError(res, error) {
    let statusCode = 500;
    let message = "Error interno del servidor";

    if (error instanceof ErrorDomain) {
        statusCode = error.getStatusCode();
        message = error.getMessage();
    } else if (error instanceof Error) {
        message = error.message;
    }

    const responsePayload = JSON.stringify({
        status: "error",
        error: {
            code: statusCode,
            message: message
        }
    });

    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-access-token",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    });

    res.end(responsePayload);
}

module.exports = {
    ErrorDomain,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    sendError,
    ErrorAuthentication: UnauthorizedError,
    ErrorSpecification: BadRequestError,
    ErrorInternServer: ErrorDomain
};