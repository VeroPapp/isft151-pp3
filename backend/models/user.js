const { objectDB } = require("../database/connectDB.js");

function getUserBySessionKey(sessionKey) {
    const sql = "SELECT * FROM users WHERE sessionKey = ?";

    try {
        const stmt = objectDB.prepare(sql);

        const userExists = stmt.get(sessionKey);

        if (!userExists) {
            return null;
        }

        const { idUser, idRole, idStatus } = userExists;

        return { IDuser: idUser, IDrole: idRole, IDstatus: idStatus };

    } catch (error) {
        throw error;
    }
}

function updateSessionKeyByID(value, idUser) {
    const sql = "UPDATE users SET sessionKey = ? WHERE idUser = ?";

    try {
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(value, idUser);

        if (result.changes === 0) {
            return null;
        }

        return { IDuser: idUser };

    } catch (error) {
        throw error;
    }
}


module.exports = { getUserBySessionKey, updateSessionKeyByID };