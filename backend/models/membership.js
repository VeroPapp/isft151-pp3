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


module.exports = {
    createMembershipApplicationDB
}