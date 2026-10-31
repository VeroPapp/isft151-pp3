const { objectDB } = require("../database/connectDB.js");

// ==========================================
// ADMINISTRADORES (CLUB_ADMIN / SUPER_ADMIN)
// ==========================================

function getUserBySessionKeyDB(sessionKey) {
    const sql = `SELECT idUser, idRole, idStatus FROM users WHERE sessionKey = ?`;
    const stmt = objectDB.prepare(sql);
    const userExists = stmt.get(sessionKey);

    if (!userExists) {
        return null;
    }

    const { idUser, idRole, idStatus } = userExists;
    return { IDuser: idUser, IDrole: idRole, IDstatus: idStatus };
}

function getUserByIdDB(IDuser) {
    const sql = `
        SELECT
            idUser, name, surname, dni, birthdate, email, phone, password, sessionKey, idRole, idStatus
        FROM users
        WHERE idUser = ?
    `;
    const stmt = objectDB.prepare(sql);
    const userExists = stmt.get(IDuser);

    if (!userExists) {
        return null;
    }

    return userExists;
}

function listMembersDB() {
    const sql = `
        SELECT
            users.idUser,
            users.name,
            users.surname,
            users.dni,
            users.birthdate,
            users.email,
            users.phone,
            users.creationDate,
            userStatus.name AS status
        FROM users
        INNER JOIN userStatus 
            ON users.idStatus = userStatus.idStatus
        WHERE users.idRole = 2
        ORDER BY users.surname ASC
    `;
    const stmt = objectDB.prepare(sql);
    const members = stmt.all();

    return members; // Si está vacío, devuelve [], lo cual es correcto
}

function changeMemberStatusDB(idStatus, idUser) {
    const sql = `
        UPDATE users
        SET idStatus = ?, sessionKey = ?
        WHERE idUser = ?
    `;

    const stmt = objectDB.prepare(sql);

    const result = stmt.run(
        idStatus,
        "NONE",
        idUser
    );

    if (result.changes === 0) {
        return null;
    }

    return { idUser: idUser };
}

function updateMemberDB(name, surname, dni, birthdate, phone, email, idUser) {
    const sql = `UPDATE users SET name = ?, surname = ?, dni = ?, birthdate = ?, phone = ?, email = ? WHERE idUser = ?`;
    const stmt = objectDB.prepare(sql);
    const result = stmt.run(name, surname, dni, birthdate, phone, email, idUser);

    if (result.changes === 0) {
        return null;
    }

    return { IDuser: idUser };
}

function updateSessionKeyDB(sessionKey, idUser) {
    const sql = `UPDATE users SET sessionKey = ? WHERE idUser = ?`;
    const stmt = objectDB.prepare(sql);
    const result = stmt.run(sessionKey, idUser);

    if (result.changes === 0) {
        return null;
    }

    return { IDuser: idUser };
}

function updatePasswordStatusSessionDB(password, idStatus, sessionKey, idUser) {
    const sql = `UPDATE users SET password = ?, idStatus = ?, sessionKey = ? WHERE idUser = ?`;
    const stmt = objectDB.prepare(sql);
    const result = stmt.run(password, idStatus, sessionKey, idUser);

    if (result.changes === 0) {
        return null;
    }

    return { IDuser: idUser };
}

// ==========================================
// SOCIOS (MEMBER)
// ==========================================

function updatePhoneDB(phone, idUser) {
    const sql = `UPDATE users SET phone = ? WHERE idUser = ?`;
    const stmt = objectDB.prepare(sql);
    const result = stmt.run(phone, idUser);

    if (result.changes === 0) {
        return null;
    }

    return { IDuser: idUser };
}


module.exports = {
    getUserBySessionKeyDB,
    getUserByIdDB,
    listMembersDB,
    updateMemberDB,
    updateSessionKeyDB,
    updatePasswordStatusSessionDB,
    changeMemberStatusDB,
    updatePhoneDB
};