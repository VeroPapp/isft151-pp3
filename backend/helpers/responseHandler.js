// Función centralizada para responder peticiones exitosas al cliente
function sendSuccess(response, data, statusCode) {
    if (!statusCode) {
        statusCode = 200;
    }

    const responsePayload = JSON.stringify({
        status: "success",
        data: data
    });

    response.writeHead(statusCode, { "Content-Type": "application/json" });

    response.end(responsePayload);
}

module.exports = {
    sendSuccess: sendSuccess
};