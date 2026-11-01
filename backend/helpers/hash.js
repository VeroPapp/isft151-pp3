const crypto = require("node:crypto");

function calculateHashSHA256(cadena) {

    return crypto.createHash("sha256").update(cadena).digest("hex");
    
}

module.exports = { calculateHashSHA256 };