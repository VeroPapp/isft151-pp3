const { objectDB } = require("../database/connectDB.js");

// ==========================================
// ADMINISTRADORES (CLUB_ADMIN / SUPER_ADMIN)
// ==========================================

// Listar los inscriptos de una actividad específica
function listRegistrationsByActivityDB(idActivity) {
    try {
        const sql = `
            SELECT 
                u.idUser, 
                u.name, 
                u.surname, 
                u.dni, 
                u.email
            FROM activityRegistrations r
            INNER JOIN users u ON r.idUser = u.idUser
            WHERE r.idActivity = ? AND r.status = 'ACTIVE'
            ORDER BY u.surname ASC, u.name ASC
        `;
        const stmt = objectDB.prepare(sql);
        return stmt.all(idActivity);
    } catch (error) {
        throw error;
    }
}

// ==========================================
// SOCIOS (MEMBER)
// ==========================================

// Registrar un socio en una actividad
function registerMemberToActivityDB(idUser, idActivity) {
    try {
        const sql = `
            INSERT INTO activityRegistrations (idUser, idActivity, status)
            VALUES (?, ?, 'ACTIVE')
            
            -- Si ya existe una inscripción para este user y activity, hacemos esto:
            ON CONFLICT(idUser, idActivity) DO UPDATE SET
            status = 'ACTIVE',
            registrationDate = CURRENT_TIMESTAMP
            WHERE status = 'CANCELLED'
        `;
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(idUser, idActivity);

        // Retorna true si insertó o reactivó una cancelada. 
        // Retorna false si ya estaba activo (el WHERE no se cumplió).
        return result.changes > 0;
    } catch (error) {
        throw error;
    }
}

// Cancelar inscripción de un socio (Baja lógica)
function cancelRegistrationDB(idUser, idActivity) {
    try {
        const sql = `
            UPDATE activityRegistrations
            SET status = 'CANCELLED' 
            WHERE idUser = ? AND idActivity = ? AND status = 'ACTIVE'
        `;
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(idUser, idActivity);
        return result.changes > 0; // Retorna true si canceló algo, false si no encontró la inscripción
    } catch (error) {
        throw error;
    }
}

// Obtener las inscripciones activas de un usuario
function listMemberRegistrationsDB(idUser) {
    try {
        const sqlRegistrations = `
            SELECT 
                a.idActivity,
                a.name,
                a.description,
                a.instructor,
                r.registrationDate
            FROM activityRegistrations r
            INNER JOIN activities a ON r.idActivity = a.idActivity
            WHERE r.idUser = ? AND r.status = 'ACTIVE'
            ORDER BY r.registrationDate DESC
        `;
        const stmt = objectDB.prepare(sqlRegistrations);
        const enrollments = stmt.all(idUser);

        const sqlSchedules = `SELECT idActivity, day, startTime, endTime FROM activitySchedules`;
        const stmtSchedules = objectDB.prepare(sqlSchedules);
        const allSchedules = stmtSchedules.all();

        for (let i = 0; i < enrollments.length; i++) {
            enrollments[i].schedules = [];

            for (let j = 0; j < allSchedules.length; j++) {
                if (allSchedules[j].idActivity === enrollments[i].idActivity) {
                    enrollments[i].schedules.push(allSchedules[j]);
                }
            }
        }

        return enrollments;
    } catch (error) {
        throw error;
    }
}

function cancelAllMemberRegistrationsDB(idUser) {
    try {
        const sql = `
            UPDATE activityRegistrations
            SET status = 'CANCELLED'
            WHERE idUser = ?
            AND status = 'ACTIVE'
        `;

        const stmt = objectDB.prepare(sql);
        const result = stmt.run(idUser);

        return result.changes;

    } catch (error) {
        throw error;
    }
}

// ========================================================
// VALIDACIONES DE CUPO ANTES DE INSCRIBIRSE A UNA ACTIVIDAD
// ========================================================

// 1. Obtener la capacidad de la actividad
function getActivityCapacityDB(idActivity) {
    const sql = `SELECT capacity FROM activities WHERE idActivity = ?`;
    try {
        const stmt = objectDB.prepare(sql);
        return stmt.get(idActivity);
    } catch (error) {
        throw error;
    }
}

// 2. Contar cuántos inscriptos activos hay en una actividad
function countActiveRegistrationsDB(idActivity) {
    const sql = `SELECT COUNT(*) as total FROM activityRegistrations WHERE idActivity = ? AND status = 'ACTIVE'`;
    try {
        const stmt = objectDB.prepare(sql);
        return stmt.get(idActivity).total;
    } catch (error) {
        throw error;
    }
}

// 3. Verificar si el usuario ya está inscripto (para saber si está cancelado)
function getUserRegistrationStatusDB(idUser, idActivity) {
    const sql = `SELECT status FROM activityRegistrations WHERE idUser = ? AND idActivity = ?`;
    try {
        const stmt = objectDB.prepare(sql);
        return stmt.get(idUser, idActivity);
    } catch (error) {
        throw error;
    }
}


// =================================================================================
// VALIDACIONES DE SUPERPOSICIÓN ENTRE HORARIOS ANTES DE INSCRIBIRSE A UNA ACTIVIDAD
// =================================================================================

// 1. Obtener los horarios de las actividades en las que el usuario ya está inscripto
function getUserActiveSchedulesDB(idUser) {
    const sql = `
        SELECT 
            a.name AS activityName,
            s.day,
            s.startTime,
            s.endTime
        FROM activityRegistrations r
        INNER JOIN activities a ON r.idActivity = a.idActivity
        INNER JOIN activitySchedules s ON a.idActivity = s.idActivity
        WHERE r.idUser = ? AND r.status = 'ACTIVE' AND a.status = 'ACTIVE'
    `;
    const stmt = objectDB.prepare(sql);
    return stmt.all(idUser);
}

// 2. Obtener los horarios de una actividad específica
function getActivitySchedulesDB(idActivity) {
    const sql = `
        SELECT day, startTime, endTime
        FROM activitySchedules
        WHERE idActivity = ?
    `;
    const stmt = objectDB.prepare(sql);
    return stmt.all(idActivity);
}

module.exports = {
    listRegistrationsByActivityDB,
    registerMemberToActivityDB,
    cancelRegistrationDB,
    listMemberRegistrationsDB,
    getActivityCapacityDB,
    countActiveRegistrationsDB,
    getUserRegistrationStatusDB,
    cancelAllMemberRegistrationsDB,
    getUserRegistrationStatusDB,
    getUserActiveSchedulesDB,
    getActivitySchedulesDB
};