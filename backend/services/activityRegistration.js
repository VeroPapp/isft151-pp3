const { sendSuccess } = require("../helpers/responseHandler.js");
const { sendError, BadRequestError, DomainError, UnauthorizedError } = require("../helpers/errorHandler.js");
const { listRegistrationsByActivityDB, registerMemberToActivityDB, cancelRegistrationDB, listMemberRegistrationsDB, getActivityCapacityDB, countActiveRegistrationsDB, getUserRegistrationStatusDB } = require("../models/activityRegistration.js");

// ==========================================
// ADMINISTRADORES (CLUB_ADMIN / SUPER_ADMIN)
// ==========================================

// listar socios inscriptos por actividad
function listRegistrationsByActivity(request, response) {
    let bodyRaw = "";
    request.on("data", chunk => bodyRaw += chunk.toString());
    request.on("end", function() {
        try {
            const data = JSON.parse(bodyRaw);
            const { idActivity } = data;

            if (!idActivity) {
                throw new BadRequestError("Falta el ID de la actividad.");
            }

            const registrations = listRegistrationsByActivityDB(idActivity);
            sendSuccess(response, { registrations }, 200);
        } catch (error) {
            sendError(response, error);
        }
    });
}


// ==========================================
// SOCIOS (MEMBER)
// ==========================================

// inscribirse a una actividad
function registerMemberToActivity(request, response) {
    let bodyRaw = "";
    
    request.on("data", chunk => bodyRaw += chunk.toString());
    
    request.on("end", function() {
        try {
            const idUser = request.user ? request.user.IDuser : null;
            if (!idUser) {
                throw new UnauthorizedError("No se pudo identificar al usuario en la sesión.");
            }

            const data = JSON.parse(bodyRaw);
            const idActivity = parseInt(data.idActivity, 10); // Asegurar que sea número

            if (!idActivity) {
                throw new BadRequestError("Falta el ID de la actividad.");
            }

            // ⭐ VALIDACIÓN DE CUPO
            const activity = getActivityCapacityDB(idActivity);
            if (!activity) {
                throw new BadRequestError("La actividad no existe.");
            }

            if (activity.capacity) {
                const currentEnrollments = countActiveRegistrationsDB(idActivity);
                
                // Si el cupo está lleno, verificamos si el usuario ya estaba dentro
                if (currentEnrollments >= activity.capacity) {
                    const existingReg = getUserRegistrationStatusDB(idUser, idActivity);
                    
                    // Si no está inscripto, o está cancelado, no puede entrar porque no hay cupo
                    if (!existingReg || existingReg.status !== 'ACTIVE') {
                        throw new DomainError("El cupo máximo de esta actividad ya está lleno.");
                    }
                }
            }

            // ⭐ SI HAY CUPO (o ya estaba inscripto), PROCEDEMOS
            const result = registerMemberToActivityDB(idUser, idActivity);
            
            if (!result) {
                throw new DomainError("Ya estás inscripto en esta actividad.");
            }

            sendSuccess(response, { message: "¡Te inscribiste con éxito a la actividad!" }, 201);

        } catch (error) {
            sendError(response, error);
        }
    });
}

// cancelar inscripción a una actividad
function cancelRegistration(request, response) {
    let bodyRaw = "";
    
    request.on("data", chunk => bodyRaw += chunk.toString());
    
    request.on("end", function() {
        try {
            const idUser = request.user ? request.user.IDuser : null;
            if (!idUser) {
                throw new UnauthorizedError("No se pudo identificar al usuario en la sesión.");
            }

            const data = JSON.parse(bodyRaw);
            const { idActivity } = data;

            if (!idActivity) {
                throw new BadRequestError("Falta el ID de la actividad.");
            }

            const cancelled = cancelRegistrationDB(idUser, idActivity);
            
            // Si devuelve false, es porque no tenía una inscripción activa
            if (!cancelled) {
                throw new DomainError("No se encontró una inscripción activa para cancelar.");
            }

            sendSuccess(response, { message: "Inscripción cancelada correctamente." }, 200);

        } catch (error) {
            sendError(response, error);
        }
    });
}

// listar las actividades inscriptas
function listMemberRegistrations(request, response) {
    try {
        const idUser = request.user ? request.user.IDuser : null;
        if (!idUser) {
            throw new UnauthorizedError("No se pudo identificar al usuario en la sesión.");
        }

        const enrollments = listMemberRegistrationsDB(idUser);

        if (!enrollments || enrollments.length === 0) {
            return sendSuccess(response, { 
                message: "No estás inscripto en ninguna actividad todavía.", 
                enrollments: [] 
            }, 200);
        }

        sendSuccess(response, { enrollments }, 200);

    } catch (error) {
        sendError(response, error);
    }
}

module.exports = { 
    listRegistrationsByActivity,
    registerMemberToActivity,
    cancelRegistration, 
    listMemberRegistrations,
};