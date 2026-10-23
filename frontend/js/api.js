import { SpecificationError, UnauthorizedError, DomainError, ProgramError } from './errors.js';

const APIVersion = "1.0"
const PORT = 3000
const Domain = `http://localhost:${PORT}`

async function RPCWebAPIFetchPublic(path, content = {}) {

    let objectConfig = {
        headers: {
            "Content-Type": "application/json",
            "x-api-version": APIVersion
        },
        method: "POST",
        body: JSON.stringify(content)
    };

    try {
        const response = await fetch(Domain + path, objectConfig);
        const result = await response.json();

        console.log("Código HTTP:", response.status);

        if (!response.ok) {

            const exception = result.error.type || "ErrorHTTP";
            const detail = result.error.message || "Sin detalles";

            if (response.status === 400) {
                throw new SpecificationError(detail, exception);
            }

            if (response.status === 401 || response.status === 403) {
                throw new UnauthorizedError(detail, exception);
            }

            if (response.status === 422) {
                throw new DomainError(detail, exception);
            }

            throw new ProgramError(detail, exception);

        }

        const tokenExists = response.headers.get("x-access-token");
        if (tokenExists) {
            localStorage.setItem("accessToken", tokenExists)
        }

        console.log("respuesta final del servidor: ", result);

        return result

    } catch (error) {
        if (error.status) throw error;
        throw new ProgramError("NetworkError", error.message);
    }
}

function getToken() {
    const token = localStorage.getItem("accessToken")
    return token
}

async function RPCWebAPIFetchPrivate(path, content = {}) {

    const token = getToken()

    let objectConfig = {
        headers: {
            "Content-Type": "application/json",
            "x-api-version": APIVersion,
            "x-access-token": token
        },
        method: "POST",
        body: JSON.stringify(content)
    };

    try {
        const response = await fetch(Domain + path, objectConfig);
        const result = await response.json();

        console.log("Código HTTP:", response.status);

        if (!response.ok) {

            const exception = result.error.type || "ErrorHTTP";
            const detail = result.error.message || "Sin detalles";

            if (response.status === 400) {
                throw new SpecificationError(detail, exception);
            }

            if (response.status === 401 || response.status === 403) {
                throw new UnauthorizedError(detail, exception);
            }

            if (response.status === 422) {
                throw new DomainError(detail, exception);
            }

            throw new ProgramError(detail, exception);

        }

        console.log("respuesta final del servidor: ", result);

        return result

    } catch (error) {
        if (error.status) throw error;
        throw new ProgramError("NetworkError", error.message);
    }
}


export { RPCWebAPIFetchPublic, RPCWebAPIFetchPrivate };