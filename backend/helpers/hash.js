const crypto = require("node:crypto");

function calcularHashSHA256(cadena) {

    return crypto.createHash("sha256").update(cadena).digest("hex");
    
}

module.exports = { calcularHashSHA256 };