//definición centralizada de errores personalizados

export class SpecificationError extends Error {
    constructor(message, detail) {
        super(message);
        this.name = "SpecificationError (HTTP 400)";
        this.detail = detail;
        this.status = 400;
    }
}

export class UnauthorizedError extends Error {
    constructor(message, detail) {
        super(message);
        this.name = "UnauthorizedError (HTTP 401)";
        this.detail = detail;
        this.status = 401;
    }
}

export class DomainError extends Error {
    constructor(message, detail) {
        super(message);
        this.name = "DomainError (HTTP 422)";
        this.detail = detail;
        this.status = 422;
    }
}

export class ProgramError extends Error {
    constructor(message, detail) {
        super(message);
        this.name = "ProgramError (HTTP 500)";
        this.detail = detail;
        this.status = 500;
    }
}