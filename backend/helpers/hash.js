const crypto = require("node:crypto");

function calcularHashSHA256(cadena) {
    if (!cadena || typeof cadena !== "string") {
        return "";
    }
    return crypto.createHash("sha256").update(cadena).digest("hex");
}

module.exports = { calcularHashSHA256 };