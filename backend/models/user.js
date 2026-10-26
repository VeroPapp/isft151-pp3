const { objectDB } = require("../database/connectDB.js");

function getUserBySessionKeyDB(sessionKey) {
    const sql = `
    SELECT idUser, idRole, idStatus
    FROM users
    WHERE sessionKey = ?
    `;

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

function getUserByIdDB(IDuser) {
    const sql = `
    SELECT
        idUser,
        name,
        surname,
        dni,
        birthdate,
        email,
        phone,
        password,
        sessionKey,
        idRole,
        idStatus
    FROM users
    WHERE idUser = ?
    `;

    try {
        const stmt = objectDB.prepare(sql);
        const userExists = stmt.get(IDuser);

        if (!userExists) {
            return null;
        }

        return userExists;

    } catch (error) {
        throw error;
    }
}


function listMembersDB() {
    try {

        const sql = `
            SELECT
                users.idUser,
                users.name,
                users.surname,
                users.dni,
                users.email,
                users.phone,
                users.creationDate,
                userStatus.name AS statusName
            FROM users
            INNER JOIN userStatus 
                ON users.idStatus = userStatus.idStatus
            WHERE users.idRole = 2
            ORDER BY 
                users.surname ASC
        `;

        const stmt = objectDB.prepare(sql);

        const members = stmt.all();

        if (members.length === 0) {
            return [];
        }

        return members
    } catch (error) {
        throw error;
    }
}


function removeMemberDB(value, idUser) {

    const sql = `
        UPDATE users
        SET idStatus = ?
        WHERE idUser = ?
    `;

    try {
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(value, idUser);

        if (result.changes === 0) {
            return null;
        }

        return { idUser: idUser };
    } catch (error) {
        throw error;
    }

}

function updateMemberDB(name, surname, dni, birthdate, phone, email, idUser) {
    const sql = `UPDATE users SET name = ?, surname = ?, dni = ?, birthdate = ?, phone = ?, email = ? WHERE idUser = ? `;

    try {
        const stmt = objectDB.prepare(sql);

        const result = stmt.run(name, surname, dni, birthdate, phone, email, idUser);

        if (result.changes === 0) {
            return null;
        }

        return { IDuser: idUser };
    } catch (error) {
        throw error;
    }
}

function updatePhoneDB(phone, idUser) {
    const sql = `UPDATE users SET phone = ? WHERE idUser = ? `;

    try {
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(phone, idUser);

        if (result.changes === 0) {
            return null;
        }

        return { IDuser: idUser };
    } catch (error) {
        throw error;
    }
}

function updateSessionKeyDB(sessionKey, idUser) {
    const sql = `UPDATE users SET sessionKey = ? WHERE idUser = ? `;

    try {
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(sessionKey, idUser);

        if (result.changes === 0) {
            return null;
        }

        return { IDuser: idUser };
    } catch (error) {
        throw error;
    }
}

function updatePasswordStatusSessionDB(password, idStatus, sessionKey, idUser) {
    const sql = `UPDATE users SET password = ?, idStatus = ?, sessionKey = ? WHERE idUser = ? `;

    try {
        const stmt = objectDB.prepare(sql);

        const result = stmt.run(password, idStatus, sessionKey, idUser);

        if (result.changes === 0) {
            return null;
        }

        return { IDuser: idUser };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getUserBySessionKeyDB,
    getUserByIdDB,
    listMembersDB,
    updateMemberDB,
    updatePhoneDB,
    updateSessionKeyDB,
    updatePasswordStatusSessionDB,
    removeMemberDB
};