// Función centralizada para responder peticiones exitosas al cliente
function sendSuccess(res, data, statusCode) {
    if (!statusCode) {
        statusCode = 200;
    }

    // Estructura JSON estandarizada para respuestas exitosas
    const responsePayload = JSON.stringify({
        status: "success",
        data: data
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
    sendSuccess: sendSuccess
};