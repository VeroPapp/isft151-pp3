const { sendSuccess } = require("../helpers/responseHandler.js");
const { sendError, BadRequestError, DomainError, UnauthorizedError } = require("../helpers/errorHandler.js");
const { listRegistrationsByActivityDB, registerMemberToActivityDB, cancelRegistrationDB, listMemberRegistrationsDB, getActivityCapacityDB, countActiveRegistrationsDB, getUserRegistrationStatusDB, getUserActiveSchedulesDB, getActivitySchedulesDB } = require("../models/activityRegistration.js");
const { getMemberByIdDB} = require("../models/member.js");
const { getRoleByIdDB } = require("../models/roles.js");

function listRegistrationsByActivity(request, response) {
    let bodyRaw = "";

    request.on("data", function(chunk) {
        bodyRaw += chunk.toString();
    });

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


function removeMemberFromActivity(request, response) {
    let bodyRaw = "";

    request.on("data", function(chunk) {
        bodyRaw += chunk.toString();
    });

    request.on("end", function() {
        try {
            const data = JSON.parse(bodyRaw);
            const { idUser, idActivity } = data;

            if (!idUser || !idActivity) {
                throw new BadRequestError("Falta el ID del usuario y actividad.");
            }

            const member = getMemberByIdDB(idUser);
            if (!member) {
                throw new BadRequestError("Usuario no encontrado.");
            }

            const roleMember = getRoleByIdDB(member.idRole)
            if (roleMember.nameRole !== "MEMBER") {
                throw new DomainError("No se puede quitar de una actividad a un usuario que no tiene el rol MEMBER.");
            }

            const cancelled = cancelRegistrationDB(idUser, idActivity);
            
            if (!cancelled) {
                throw new DomainError("No se encontró una inscripción activa para cancelar asociado a ese usuario.");
            }

            sendSuccess(response, { message: "Inscripción cancelada correctamente." }, 200);

        } catch (error) {
            sendError(response, error);
        }
    });
}


function registerMemberToActivity(request, response) {
    let bodyRaw = "";

    request.on("data", function(chunk) {
        bodyRaw += chunk.toString();
    });

    request.on("end", function () {
        try {
            const idUser = request.user ? request.user.idUser : null;
            if (!idUser) {
                throw new UnauthorizedError("No se pudo identificar al usuario en la sesión.");
            }

            const data = JSON.parse(bodyRaw);
            const idActivity = parseInt(data.idActivity, 10); 

            if (!idActivity) {
                throw new BadRequestError("Falta el ID de la actividad.");
            }
            
            const activity = getActivityCapacityDB(idActivity);
            if (!activity) {
                throw new BadRequestError("La actividad no existe.");
            }
            
            const existingReg = getUserRegistrationStatusDB(idUser, idActivity);

            if (existingReg && existingReg.status === 'ACTIVE') {
                throw new DomainError("Ya estás inscripto en esta actividad.");
            }
            
            if (activity.capacity) {
                const currentRegistrations = countActiveRegistrationsDB(idActivity);
                if (currentRegistrations >= activity.capacity && (!existingReg || existingReg.status !== 'ACTIVE')) {
                    throw new DomainError("El cupo máximo de esta actividad ya está lleno.");
                }
            }

            
            const newSchedules = getActivitySchedulesDB(idActivity);
            const userSchedules = getUserActiveSchedulesDB(idUser);

            for (let i = 0; i < newSchedules.length; i++) {
                const newSched = newSchedules[i];

                for (let j = 0; j < userSchedules.length; j++) {
                    const userSched = userSchedules[j];
                    
                    if (newSched.day === userSched.day) {
                        
                        const hayChoque = 
                            newSched.startTime < userSched.endTime &&
                            userSched.startTime < newSched.endTime;

                        if (hayChoque) {
                            throw new DomainError(
                                "No podés inscribirte, el horario (" + 
                                newSched.day + " " + newSched.startTime + "-" + newSched.endTime + 
                                ") choca con tu inscripción en '" + userSched.activityName + 
                                "' (" + userSched.day + " " + userSched.startTime + "-" + userSched.endTime + ")."
                            );
                        }
                    }
                }
            }

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


function cancelRegistration(request, response) {
    let bodyRaw = "";
    
    request.on("data", function(chunk) {
        bodyRaw += chunk.toString();
    });

    request.on("end", function () {
        try {
            const idUser = request.user ? request.user.idUser : null;
            if (!idUser) {
                throw new UnauthorizedError("No se pudo identificar al usuario en la sesión.");
            }

            const data = JSON.parse(bodyRaw);
            const { idActivity } = data;

            if (!idActivity) {
                throw new BadRequestError("Falta el ID de la actividad.");
            }

            const cancelled = cancelRegistrationDB(idUser, idActivity);
            
            if (!cancelled) {
                throw new DomainError("No se encontró una inscripción activa para cancelar.");
            }

            sendSuccess(response, { message: "Inscripción cancelada correctamente." }, 200);

        } catch (error) {
            sendError(response, error);
        }
    });
}


function listMemberRegistrations(request, response) {
    try {
        const idUser = request.user ? request.user.idUser : null;
        if (!idUser) {
            throw new UnauthorizedError("No se pudo identificar al usuario en la sesión.");
        }

        const registrations = listMemberRegistrationsDB(idUser);

        if (!registrations || registrations.length === 0) {
            return sendSuccess(response, {
                message: "No estás inscripto en ninguna actividad todavía.",
                registrations: []
            }, 200);
        }

        sendSuccess(response, { registrations }, 200);

    } catch (error) {
        sendError(response, error);
    }
}


module.exports = {
    listRegistrationsByActivity,
    removeMemberFromActivity,
    registerMemberToActivity,
    cancelRegistration,
    listMemberRegistrations,
};