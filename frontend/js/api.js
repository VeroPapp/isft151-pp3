import { SpecificationError, UnauthorizedError, DomainError, ProgramError } from './errors.js';

const BASE_URL = "http://localhost:3000";

function getToken() {
    return localStorage.getItem("accessToken");
}

async function RPCWebAPIFetch(endpoint, content = {}) {
    const pathLimpio = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
    const urlDestino = BASE_URL + pathLimpio;

    const cabecerasHTTP = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) cabecerasHTTP["x-access-token"] = token;

    const opciones = {
        method: "POST",
        headers: cabecerasHTTP,
        body: JSON.stringify(content)
    };

    try {
        const respuesta = await fetch(urlDestino, opciones);
        let payload;

        try {
            payload = await respuesta.json();
        } catch (e) {
            payload = { error: { type: "InvalidJSON", message: "La respuesta no es JSON válido" } };
        }

        if (respuesta.ok) {
            let tokenEncontrado = respuesta.headers.get("x-access-token");
            if (!tokenEncontrado) {
                tokenEncontrado = payload.token || payload.data?.token || payload.data?.sessionKey;
            }
            if (tokenEncontrado) {
                localStorage.setItem("accessToken", tokenEncontrado);
            }
            return { data: payload.data || payload, _accessToken: tokenEncontrado };
        }

        const excepcion = payload.error?.type || "ErrorHTTP";
        const detalle = payload.error?.message || "Sin detalles";

        if (respuesta.status === 400) throw new SpecificationError(detalle, excepcion);
        if (respuesta.status === 401 || respuesta.status === 403) throw new UnauthorizedError(detalle, excepcion);
        if (respuesta.status === 422) throw new DomainError(detalle, excepcion);

        throw new ProgramError(detalle, excepcion);
    } catch (error) {
        if (error.status) throw error;
        throw new ProgramError("NetworkError", error.message);
    }
}

export { RPCWebAPIFetch };