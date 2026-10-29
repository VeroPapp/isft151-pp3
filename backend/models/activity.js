const { objectDB } = require("../database/connectDB.js");

// ==========================================
// ADMINISTRADORES (CLUB_ADMIN / SUPER_ADMIN)
// ==========================================

// listar todas las actividades
function listAllActivitiesDB() {
    try {
        let sql = `
            SELECT 
                a.idActivity, 
                a.name, 
                a.description, 
                a.instructor, 
                a.capacity,
                a.startDate,
                a.endDate,
                (a.capacity - (SELECT COUNT(*) FROM activityRegistrations r WHERE r.idActivity = a.idActivity AND r.status = 'ACTIVE')) AS availablePlaces,
                a.scope, 
                a.status
            FROM activities a
        `;
        const stmt = objectDB.prepare(sql);
        const activities = stmt.all();

        const sqlSchedules = `SELECT idActivity, day, startTime, endTime FROM activitySchedules`;
        const allSchedules = objectDB.prepare(sqlSchedules).all();

        for (let i = 0; i < activities.length; i++) {
            activities[i].schedules = [];
            for (let j = 0; j < allSchedules.length; j++) {
                if (allSchedules[j].idActivity === activities[i].idActivity) {
                    activities[i].schedules.push(allSchedules[j]);
                }
            }
        }
        return activities;
    } catch (error) {
        throw error;
    }
}

// crear una nueva actividad (administrador)
function createActivityDB(activityData, schedulesData) {
    try {
        const sqlActivity = `INSERT INTO activities (name, description, startDate, endDate, instructor, capacity, scope) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const stmtActivity = objectDB.prepare(sqlActivity);
        
        const result = stmtActivity.run(
            activityData.name, 
            activityData.description || null,
            activityData.startDate || null,
            activityData.endDate || null, 
            activityData.instructor || null, 
            activityData.capacity || null, 
            activityData.scope || null
        );
        
        const newActivityId = result.lastInsertRowid;

        if (schedulesData && schedulesData.length > 0) {
            // Usamos INSERT OR IGNORE para saltear horarios idénticos
            const sqlSchedule = `INSERT OR IGNORE INTO activitySchedules (idActivity, day, startTime, endTime) VALUES (?, ?, ?, ?)`;
            const stmtSchedule = objectDB.prepare(sqlSchedule);
            
            for (let i = 0; i < schedulesData.length; i++) {
                const schedule = schedulesData[i];
                stmtSchedule.run(newActivityId, schedule.day, schedule.startTime, schedule.endTime);
            }
        }   

        return newActivityId;
    } catch (error) {
        throw error;
    }
}

// Actualizar una actividad existente (administrador)
function updateActivityDB(idActivity, activityData, schedulesData) {
    try {
        // Actualizamos solo los datos generales de la actividad
        const sqlUpdate = `
            UPDATE activities 
            SET name = ?, description = ?, startDate = ?, endDate = ?, instructor = ?, capacity = ?, scope = ?
            WHERE idActivity = ?
        `;
        const stmtUpdate = objectDB.prepare(sqlUpdate);
        
        const result = stmtUpdate.run(
            activityData.name,
            activityData.description || null,
            activityData.startDate || null,
            activityData.endDate || null,
            activityData.instructor || null,
            activityData.capacity || null,
            activityData.scope || null,
            idActivity
        );

        // Si no hubo cambios en la actividad o no se encontró, cortamos acá
        if (result.changes === 0) {
            return 0;
        }

        // Si nos mandaron horarios, actualizamos la tabla de horarios
        if (schedulesData && schedulesData.length > 0) {
            // Borramos los horarios viejos
            const sqlDeleteSchedules = `DELETE FROM activitySchedules WHERE idActivity = ?`;
            const stmtDeleteSchedules = objectDB.prepare(sqlDeleteSchedules);
            stmtDeleteSchedules.run(idActivity);

            // Insertamos los nuevos (ignorando duplicados si los hubiera)
            const sqlInsertSchedule = `INSERT OR IGNORE INTO activitySchedules (idActivity, day, startTime, endTime) VALUES (?, ?, ?, ?)`;
            const stmtInsertSchedule = objectDB.prepare(sqlInsertSchedule);

            for (let i = 0; i < schedulesData.length; i++) {
                const schedule = schedulesData[i];
                stmtInsertSchedule.run(idActivity, schedule.day, schedule.startTime, schedule.endTime);
            }
        }

        return result.changes;
    } catch (error) {
        throw error;
    }
}

// Función para dar de baja (Cambia el estado a INACTIVE)
function deactivateActivityDB(idActivity) {
    try {
        const sql = `UPDATE activities SET status = 'INACTIVE' WHERE idActivity = ?`;
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(idActivity);
        return result.changes > 0;
    } catch (error) {
        throw error;
    }
}

function activateActivityDB(idActivity) {
    try {
        const sql = `UPDATE activities SET status = 'ACTIVE' WHERE idActivity = ?`;
        const stmt = objectDB.prepare(sql);
        const result = stmt.run(idActivity);
        return result.changes > 0;
    } catch (error) {
        throw error;
    }
}

// ==========================================
// SOCIOS (MEMBER)
// ==========================================

// Listar solo las actividades activas (socio e index)
function listActiveActivitiesDB() {
    try {
        // 1. Traemos todas las actividades activas con sus cupos calculados
        const sql = `
            SELECT 
                a.idActivity,
                a.name,
                a.description,
                a.instructor,
                a.capacity,
                a.startDate,
                a.endDate,
                (a.capacity - (SELECT COUNT(*) FROM activityRegistrations r WHERE r.idActivity = a.idActivity AND r.status = 'ACTIVE')) AS availablePlaces,
                a.scope,
                a.status
            FROM activities a
            WHERE a.status = 'ACTIVE'
        `;

        const stmt = objectDB.prepare(sql);
        const activities = stmt.all();

        // 2. Traemos todos los horarios
        const sqlSchedules = `SELECT idActivity, day, startTime, endTime FROM activitySchedules`;
        const stmtSchedules = objectDB.prepare(sqlSchedules);
        const allSchedules = stmtSchedules.all();

        // 3. Combinamos actividades con sus horarios
        for (let i = 0; i < activities.length; i++) {
            activities[i].schedules = []; 
            
            for (let j = 0; j < allSchedules.length; j++) {
                if (allSchedules[j].idActivity === activities[i].idActivity) {
                    activities[i].schedules.push(allSchedules[j]);
                }
            }
        }

        return activities;

    } catch (error) {
        throw error;
    }
}

module.exports = {
    listAllActivitiesDB,
    createActivityDB,
    updateActivityDB,
    deactivateActivityDB,
    activateActivityDB,
    listActiveActivitiesDB
};