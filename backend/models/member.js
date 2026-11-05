const { objectDB } = require("../database/connectDB.js");



function getMemberBySessionKeyDB(sessionKey) {
    const sql = `SELECT idUser, idRole, idStatus FROM users WHERE sessionKey = ?`;
    const stmt = objectDB.prepare(sql);
    const userExists = stmt.get(sessionKey);

    if (!userExists) {
        return null;
    }

    const { idUser, idRole, idStatus } = userExists;
    return { idUser: idUser, IDrole: idRole, IDstatus: idStatus };
}

function getMemberByIdDB(idUser) {
    const sql = `
        SELECT
            idUser, name, surname, dni, birthdate, email, phone, password, sessionKey, idRole, idStatus
        FROM users
        WHERE idUser = ?
    `;
    const stmt = objectDB.prepare(sql);
    const userExists = stmt.get(idUser);

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
        ORDER BY users.idUser ASC
    `;
    const stmt = objectDB.prepare(sql);
    const members = stmt.all();

    return members; 
}

function changeMemberStatusDB(idStatus, idUser, savePreviousStatus) {
    let sql;
    
    if (savePreviousStatus) {
        sql = `UPDATE users SET previousStatus = idStatus, idStatus = ? WHERE idUser = ?`;
    } else {
        sql = `UPDATE users SET idStatus = COALESCE(previousStatus, ?), previousStatus = NULL WHERE idUser = ?`;
    }

    try {
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(idStatus, idUser);

        if (result.changes === 0) {
            return null;
        }

        return { idUser: idUser };
    } catch (error) {
        throw error;
    }
}

function updateMemberDB(name, surname, dni, birthdate, phone, email, idUser) {
    const sql = `UPDATE users SET name = ?, surname = ?, dni = ?, birthdate = ?, phone = ?, email = ? WHERE idUser = ?`;
    const stmt = objectDB.prepare(sql);
    const result = stmt.run(name, surname, dni, birthdate, phone, email, idUser);

    if (result.changes === 0) {
        return null;
    }

    return { idUser: idUser };
}

function updateSessionKeyDB(sessionKey, idUser) {
    const sql = `UPDATE users SET sessionKey = ? WHERE idUser = ?`;
    const stmt = objectDB.prepare(sql);
    const result = stmt.run(sessionKey, idUser);

    if (result.changes === 0) {
        return null;
    }

    return { idUser: idUser };
}

function updatePasswordStatusSessionDB(password, idStatus, sessionKey, idUser) {
    const sql = `UPDATE users SET password = ?, idStatus = ?, sessionKey = ? WHERE idUser = ?`;
    const stmt = objectDB.prepare(sql);
    const result = stmt.run(password, idStatus, sessionKey, idUser);

    if (result.changes === 0) {
        return null;
    }

    return { idUser: idUser };
}



function updatePhoneDB(phone, idUser) {
    const sql = `UPDATE users SET phone = ? WHERE idUser = ?`;
    const stmt = objectDB.prepare(sql);
    const result = stmt.run(phone, idUser);

    if (result.changes === 0) {
        return null;
    }

    return { idUser: idUser };
}


module.exports = {
    getMemberBySessionKeyDB,
    getMemberByIdDB,
    listMembersDB,
    updateMemberDB,
    updateSessionKeyDB,
    updatePasswordStatusSessionDB,
    changeMemberStatusDB,
    updatePhoneDB
};