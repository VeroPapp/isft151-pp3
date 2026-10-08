const { objectDB } = require("../database/connectDB.js");
const { calcularHashSHA256 } = require("../helpers/hash.js");

function authenticate(emailUser, password) {
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

    try {
        const stmt = objectDB.prepare(sql);
        
        const hashedPassword = calcularHashSHA256(password);

        const userExists = stmt.get(emailUser, hashedPassword);

        if (!userExists) {
            return null;
        }

        const { idUser, name, surname, idRole, temporaryPassword, idStatus, email } = userExists;

        return { idUser, name, surname, idRole, temporaryPassword, idStatus, email };

    } catch (error) {
        throw error;
    }
}

module.exports = { authenticate };