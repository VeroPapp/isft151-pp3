const { objectDB } = require("../database/connectDB.js")
const { DomainError } = require("../helpers/errorHandler.js")


function createMembershipApplicationDB(name, surname, dni, birthdate, email, phone) {

    // Verificar si ya existe un usuario con ese DNI o email
    const sqlCheck = `
        SELECT idUser
        FROM users
        WHERE dni = ? OR email = ?
    `

    const stmtCheck = objectDB.prepare(sqlCheck)
    const userExists = stmtCheck.get(dni, email)

    if (userExists) {
        const error = new DomainError("El numero de DNI o email ya está registrado en el sistema.")
        throw error
    }

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
            temporaryPassword,
            idStatus,
            idRole
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `

    const stmtInsert = objectDB.prepare(sqlInsert)

    const result = stmtInsert.run(
        name,
        surname,
        dni,
        birthdate,
        email,
        phone,
        dni, //* La contraseña temporal es el mismo DNI
        1, //* La contraseña temporal está activa
        1 //* El estado PENDING tiene idStatus = 1
    )

    return result.lastInsertRowid
}


module.exports = {
    createMembershipApplicationDB
}