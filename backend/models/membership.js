const { objectDB } = require("../database/connectDB.js")
const { DomainError } = require("../helpers/errorHandler.js")
const { calcularHashSHA256 } = require("../helpers/hash.js")


function createMembershipApplicationDB(name, surname, dni, birthdate, email, phone) {

    try {

        // Verificar si ya existe un usuario con ese DNI o email
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

        const passwordHash = calcularHashSHA256(dni)

        // Crear usuario con estado PENDING,
        // sin rol y con contraseña temporal
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
            passwordHash, //* La contraseña temporal es el mismo DNI
            'NONE', // * la sessionKey al inicio es 'NONE'
            1, //* El estado PENDINGFORAPPROBATION tiene idStatus = 1
            1 //* el estado del role es NONE, hasta que el admin lo apruebe y cambie a MEMBER
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

        //Los alias AS status y AS role son para que en el JSON final no aparezcan como name porque aparece en la base de datos, sino como status y role, respectivamente.
        //(que sería ambiguo, porque tanto userStatus como roles tienen columna name).


        const stmt = objectDB.prepare(sql);
        return stmt.all();

    } catch (error) {
        throw error;
    }

}

function approveMembershipApplicationDB(idUser) {
    try {
        // Solo aprobamos si el usuario está PENDINGFORAPPROBATION (idStatus = 1).
        // Lo pasamos a PENDINGFORPASSWORDCHANGE (idStatus = 2) y le damos rol MEMBER (idRole = 2).
        const sql = `
            UPDATE users
            SET idStatus = 2, idRole = 2
            WHERE idUser = ? AND idStatus = 1
        `;

        const stmt = objectDB.prepare(sql);
        const result = stmt.run(idUser);

        return result.changes > 0; // true si actualizó algo, false si no había nada que aprobar

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