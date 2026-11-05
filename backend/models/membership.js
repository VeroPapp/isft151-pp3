const { objectDB } = require("../database/connectDB.js")
const { DomainError } = require("../helpers/errorHandler.js")
const { calculateHashSHA256 } = require("../helpers/hash.js")


function createMembershipApplicationDB(name, surname, dni, birthdate, email, phone) {

    try {

        
        const sqlCheck = `
            SELECT idUser
            FROM users
            WHERE dni = ? OR email = ?
        `

        const stmtCheck = objectDB.prepare(sqlCheck)
        const userExists = stmtCheck.get(dni, email)

        if (userExists) {
            return false
        }

        const passwordHash = calculateHashSHA256(dni)

        
        const sqlInsert = `
            INSERT INTO users
            (
                name,
                surname,
                dni,
                birthdate,
                email,
                phone,
                password,
                sessionKey,
                idStatus,
                idRole
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `

        const stmtInsert = objectDB.prepare(sqlInsert)

        const result = stmtInsert.run(
            name,
            surname,
            dni,
            birthdate,
            email,
            phone,
            passwordHash, 
            'NONE', 
            1, 
            1 
        )

        return result.lastInsertRowid

    } catch (error) {
        throw error
    }
}

function listMembershipApplicationsDB() {
    try {
        const sql = `
            SELECT
                u.idUser,
                u.name,
                u.surname,
                u.dni,
                u.birthdate,
                u.email,
                u.phone,
                u.creationDate,
                us.name AS status,
                r.name AS role
            FROM users u
            INNER JOIN userStatus us ON u.idStatus = us.idStatus
            INNER JOIN roles r ON u.idRole = r.idRole
            WHERE us.name = 'PENDINGFORAPPROBATION'
            ORDER BY u.creationDate ASC, u.idUser ASC
        `;

        


        const stmt = objectDB.prepare(sql);
        return stmt.all();

    } catch (error) {
        throw error;
    }

}

function approveMembershipApplicationDB(idUser) {
    try {
        
        const sql = `
            UPDATE users
            SET idStatus = 2, idRole = 2
            WHERE idUser = ? AND idStatus = 1
        `;

        const stmt = objectDB.prepare(sql);
        const result = stmt.run(idUser);

        return result.changes > 0; 

    } catch (error) {
        throw error;
    }
}

function rejectMembershipApplicationDB(idUser) {
    const sql = `
        UPDATE users
        SET idStatus = 4
        WHERE idUser = ? AND idStatus = 1
    `;
    const stmt = objectDB.prepare(sql);
    return stmt.run(idUser).changes > 0;
}

module.exports = {
    createMembershipApplicationDB,
    listMembershipApplicationsDB,
    approveMembershipApplicationDB,
    rejectMembershipApplicationDB
};