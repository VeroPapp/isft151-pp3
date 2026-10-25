const { objectDB } = require("../database/connectDB.js");

// 1. Listar actividades 
function listActivitiesDB(filters = {}){
    try {
        let sql = `
            SELECT 
                a.idActivity,
                a.name,
                a.description,
                a.instructor,
                a.capacity,
                (a.capacity - (SELECT COUNT(*) FROM activity_registration r WHERE r.idActivity = a.idActivity AND r.status = 'ACTIVE')) AS availablePlaces,
                a.startDate,
                a.endDate,
                a.trainingDays,
                a.trainingTime,
                a.scope,
                a.status
            FROM activities a
            WHERE a.status = 'ACTIVE'
        `;
        let params = [];
        if (filters.name) {
            sql += ` AND a.name LIKE ?`;
            params.push(`%${filters.name}%`);
        }
        if (filters.scope) {
            sql += ` AND a.scope = ?`;
        }

        const stmt = objectDB.prepare(sql);
        return stmt.all(...params);
    } catch (error) {
        throw error;
    }
} 

// crear una nueva actividad (administrador)
function createActivityDB(activityData) {
    try {
        const sql = `
            INSERT INTO activities (name, description, startDate, endDate, instructor, capacity, trainingDays, trainingTime, scope, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        `;
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(
            activityData.name,
            activityData.description || "",
            activityData.startDate,
            activityData.endDate,
            activityData.instructor,
            activityData.capacity,
            activityData.trainingDays,
            activityData.trainingTime,
            activityData.scope
        );
        return result.lastInsertRowid;
    } catch (error) {
        throw error;
    }
}

// Actualizar una actividad existente  (administrador)
function updateActivityDB(idActivity, activityData) {
    try {
        const sql = `
            UPDATE activities 
            SET name = ?, description = ?, startDate = ?, endDate = ?, instructor = ?, capacity = ?, trainingDays = ?, trainingTime = ?, scope = ?
            WHERE idActivity = ?
        `;
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(
            activityData.name,
            activityData.description || "",
            activityData.startDate,
            activityData.endDate,
            activityData.instructor,
            activityData.capacity,
            activityData.trainingDays,
            activityData.trainingTime,
            activityData.scope,
            idActivity
        );
        return result.changes; // Retorna la cantidad de filas modificadas
    } catch (error) {
        throw error;
    }
}

// registrar un socio en una actividad
function registerMemberToActivityDB(idUser, idActivity) {
    try {
        const sql = `
            INSERT INTO activity_registration (idUser, idActivity, status)
            VALUES (?, ?, 'ACTIVE')
        `;
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(idUser, idActivity);
        return result.lastInsertRowid;
    } catch (error) {
        throw error;
    }
}

// cancelar inscripcion de un socio
function cancelRegistrationDB(idUser, idActivity) {
    try {
        const sql = `
            UPDATE activity_registration 
            SET status = 'CANCELLED' 
            WHERE idUser = ? AND idActivity = ? AND status = 'ACTIVE'
        `;
        const stmt = objectDB.prepare(sql);
        return stmt.run(idUser, idActivity);
    } catch (error) {
        throw error;
    }
}

// Obtener las inscripciones activas de un usuario
function listUserEnrollmentsDB(idUser) {
    try {
        const sql = `
            SELECT 
                a.idActivity,
                a.name,
                a.description,
                a.instructor,
                a.trainingDays,
                a.trainingTime,
                r.registrationDate
            FROM activity_registration r
            INNER JOIN activities a ON r.idActivity = a.idActivity
            WHERE r.idUser = ? AND r.status = 'ACTIVE'
            ORDER BY r.registrationDate DESC
        `;
        const stmt = objectDB.prepare(sql);
        return stmt.all(idUser);
    } catch (error) {
        throw error;
    }
}

// Obtener las inscripciones activas de un usuario
function listUserEnrollmentsDB(idUser) {
    try {
        const sql = `
            SELECT 
                a.idActivity,
                a.name,
                a.description,
                a.instructor,
                a.trainingDays,
                a.trainingTime,
                r.registrationDate
            FROM activity_registration r
            INNER JOIN activities a ON r.idActivity = a.idActivity
            WHERE r.idUser = ? AND r.status = 'ACTIVE'
            ORDER BY r.registrationDate DESC
        `;
        const stmt = objectDB.prepare(sql);
        return stmt.all(idUser);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    listActivitiesDB,
    createActivityDB,
    updateActivityDB,
    registerMemberToActivityDB,
    cancelRegistrationDB,
    listUserEnrollmentsDB 
};