const { dbObject } = require("../database/connectionDB.js")

async function createMembershipApplicationDB(name, surname, dni, birthdate, email, phone) {
    
    // Verificar si ya existe un usuario con ese DNI o email
    const [users] = await dbObject.query(
        `SELECT id_user 
         FROM USER 
         WHERE dni = ? OR email = ?`,
        [dni, email]
    )

    if (users.length > 0) {
        const error = new ErrorDomain()
        throw error
    }

    // Crear usuario con estado PENDING y sin rol
    const [result] = await dbObject.query(
        `INSERT INTO USER
        (name, surname, dni, birthdate, email, phone, status, id_role)
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING', NULL)`,
        [name, surname, dni, birthdate, email, phone]
    )

    return result.insertId
}


async function assignMemberRolePendingDB(idUser, idRol) {
  const sql = `
    INSERT INTO user_rol (id_user, id_rol, status, assignment_date)
    VALUES ($1, $2, 'PENDING', NOW())
    RETURNING id_user_rol
  `;
  const result = await dbObject.query(sql, [idUser, idRol]);
  return result.rows[0];
}

module.exports = {
  createMembershipApplicationDB,
  assignMemberRolePendingDB
};