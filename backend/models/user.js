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

function getUserByID(IDuser) {
    const sql = "SELECT * FROM users WHERE idUser = ?";

    try {
        const stmt = objectDB.prepare(sql);
        const userExists = stmt.get(IDuser);

        if (!userExists) {
            return null;
        }

        const { name, surname, dni, birthdate, email, phone, password, sessionKey } = userExists;

        return {
            name,
            surname,
            dni,
            birthdate,
            email,
            phone,
            password,
            sessionKey
        };
    } catch (error) {
        throw error;
    }
}

function updatePasswordByID(newPassword, IDuser) {
    const sql = "UPDATE users SET password = ? WHERE idUser = ?";

    try {
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(newPassword, IDuser);

        if (result.changes === 0) {
            return null;
        }

        return { IDuser: IDuser };
    } catch (error) {
        throw error;
    }
}

function updateStatusByID(value, IDuser) {
    const sql = "UPDATE users SET idStatus = ? WHERE idUser = ?";

    try {
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(value, IDuser);

        if (result.changes === 0) {
            return null;
        }

        return { IDuser: IDuser };
    } catch (error) {
        throw error;
    }
}

function listMembersDB() {
    try {
        const sql = `
            SELECT
                u.idUser,
                u.name,
                u.surname,
                u.dni,
                u.email,
                u.phone,
                u.creationDate,
                us.name AS status
            FROM users u
            INNER JOIN userStatus us ON u.idStatus = us.idStatus
            WHERE u.idRole = 2
            ORDER BY u.surname ASC, u.name ASC
        `;
        const stmt = objectDB.prepare(sql);
        return stmt.all();
    } catch (error) {
        throw error;
    }
}


module.exports = { getUserBySessionKey, updateSessionKeyByID, getUserByID, updatePasswordByID, updateStatusByID, listMembersDB };