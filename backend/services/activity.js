const { sendSuccess } = require("../helpers/responseHandler.js");
const { sendError, BadRequestError, DomainError } = require("../helpers/errorHandler.js");
const { listAllActivitiesDB, listActiveActivitiesDB, createActivityDB, updateActivityDB, deactivateActivityDB, activateActivityDB } = require("../models/activity.js");

function listAllActivities(request, response) {
    try {
        const activities = listAllActivitiesDB();
        sendSuccess(response, { activities }, 200);
    } catch (error) {
        sendError(response, error);
    }
}

function listActiveActivities(request, response) {
    try {
        const activities = listActiveActivitiesDB();
        if (activities.length === 0) {
            return sendSuccess(response, { message: "No hay actividades cargadas.", activities: [] }, 200);
        }
        sendSuccess(response, { activities }, 200);
    } catch (error) {
        sendError(response, error);
    }
}

function createActivity(request, response) {
    let bodyRaw = "";
    request.on("data", chunk => bodyRaw += chunk.toString());
    request.on("end", () => {
        try {
            const data = JSON.parse(bodyRaw);
            const { name, description, startDate, endDate, instructor, capacity, scope, schedules } = data;

            if (!name || !schedules || schedules.length === 0) {
                throw new BadRequestError("El nombre y al menos un horario son obligatorios.");
            }

            createActivityDB({ name, description, startDate, endDate, instructor, capacity, scope }, schedules);
            sendSuccess(response, { message: "Actividad creada correctamente." }, 201);
        } catch (error) {
            sendError(response, error);
        }
    });
}

function updateActivity(request, response) {
    let bodyRaw = "";
    request.on("data", chunk => bodyRaw += chunk.toString());
    request.on("end", () => {
        try {
            const data = JSON.parse(bodyRaw);
            const { idActivity, name, description, startDate, endDate, instructor, capacity, scope, schedules } = data;

            if (!idActivity || !name || !schedules || schedules.length === 0) {
                throw new BadRequestError("Faltan campos obligatorios (ID, nombre y al menos un horario).");
            }

            const changes = updateActivityDB(idActivity, { name, description, startDate, endDate, instructor, capacity, scope }, schedules);
            
            if (changes === 0) {
                throw new DomainError("No se encontró la actividad o no hubo cambios.");
            }

            sendSuccess(response, { message: "Actividad actualizada correctamente." }, 200);
        } catch (error) {
            sendError(response, error);
        }
    });
}

function deactivateActivity(request, response) {
    let bodyRaw = "";
    request.on("data", chunk => bodyRaw += chunk.toString());
    request.on("end", () => {
        try {
            const data = JSON.parse(bodyRaw);
            const { idActivity } = data;

            if (!idActivity) throw new BadRequestError("Falta el ID de la actividad.");

            const ok = deactivateActivityDB(idActivity);
            if (!ok) throw new DomainError("No se encontró la actividad.");

            sendSuccess(response, { message: "Actividad dada de baja correctamente." }, 200);
        } catch (error) {
            sendError(response, error);
        }
    });
}

function activateActivity(request, response) {
    let bodyRaw = "";
    request.on("data", chunk => bodyRaw += chunk.toString());
    request.on("end", () => {
        try {
            const data = JSON.parse(bodyRaw);
            const { idActivity } = data;

            if (!idActivity) throw new BadRequestError("Falta el ID de la actividad.");

            const ok = activateActivityDB(idActivity);
            if (!ok) throw new DomainError("No se encontró la actividad.");

            sendSuccess(response, { message: "Actividad reactivada correctamente." }, 200);
        } catch (error) {
            sendError(response, error);
        }
    });
}

module.exports = { 
    listAllActivities,
    listActiveActivities, 
    createActivity, 
    updateActivity, 
    deactivateActivity,
    activateActivity
};