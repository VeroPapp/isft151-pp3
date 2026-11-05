const { objectDB } = require("../database/connectDB.js");

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

function updateActivityDB(idActivity, activityData, schedulesData) {
    try {
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

        if (result.changes === 0) {
            return 0;
        }

        if (schedulesData && schedulesData.length > 0) {
            const sqlDeleteSchedules = `DELETE FROM activitySchedules WHERE idActivity = ?`;
            const stmtDeleteSchedules = objectDB.prepare(sqlDeleteSchedules);
            stmtDeleteSchedules.run(idActivity);

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

function listActiveActivitiesDB() {
    try {
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

        const sqlSchedules = `SELECT idActivity, day, startTime, endTime FROM activitySchedules`;
        const stmtSchedules = objectDB.prepare(sqlSchedules);
        const allSchedules = stmtSchedules.all();

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