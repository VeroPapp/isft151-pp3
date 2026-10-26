const {
    listActivitiesDB,
    createActivityDB,
    updateActivityDB,
    registerMemberToActivityDB,
    cancelRegistrationDB,
    listUserEnrollmentsDB
} = require("../models/activity.js");
const {sendSuccess } = require("../helpers/responseHandler.js");
const {sendError, BadRequestError, DomainError } = require("../helpers/errorHandler.js");


function listActivities(request, response) {
    let body = "";

    request.on("data", function (chunk) {
        body += chunk.toString();
    });

    request.on("end", async function () {
        try {
            let data = {};
            if (body.trim() !== "") {
                try {
                    data = JSON.parse(body);
                } catch (e) {
                    throw new BadRequestError("InvalidJSON", ["El cuerpo de la petición no es un JSON válido."]);
                }
            }

            // llamamos al modelo pasando los filtros opcionales (name, scope, etc.)
            const activities = listActivitiesDB(data);

            sendSuccess(response, { activities: activities }, 200);
        } catch (error) {
            sendError(response, error);
        }
    });
}

function createActivity(request, response) {
    let body = "";

    request.on("data", function (chunk) {
        body += chunk.toString();
    });

    request.on("end", async function () {
        try {
            const data = JSON.parse(body);

            // validaciones basicas de campos obligatorios
            if (!data.name || !data.capacity) {
                throw new BadRequestError("MissingFields", ["El nombre y la capacidad de la actividad son obligatorios."]);
            }

            const idActivity = createActivityDB(data);

            sendSuccess(response, { 
                idActivity: idActivity,
                status: "ACTIVE",
                message: "Actividad creada correctamente" 
            }, 200);
        } catch (error) {
            sendError(response, error);
        }
    });
}

function updateActivity(request, response) {
    let body = "";

    request.on("data", function (chunk) {
        body += chunk.toString();
    });

    request.on("end", async function () {
        try {
            const data = JSON.parse(body);
            const { idActivity, name, capacity, trainingDays, trainingTime, startDate, endDate, instructor, scope, description } = data;

            if (!idActivity || !name || !capacity) {
                throw new BadRequestError("El ID, el nombre y la capacidad de la actividad son obligatorios.");
            }

            const updatedRows = updateActivityDB(idActivity, {
                name,
                description,
                startDate,
                endDate,
                instructor,
                capacity,
                trainingDays,
                trainingTime,
                scope
            });

            if (updatedRows === 0) {
                throw new BadRequestError("No se encontró la actividad a actualizar.");
            }

            sendSuccess(response, { message: "Actividad actualizada correctamente." }, 200);
        } catch (error) {
            sendError(response, error);
        }
    });
}
// FUNCION REGISTRAR SOCIO A ACTIVIDAD
function registerMemberToActivity(request, response, currentUser) {
    let body = "";
    
    request.on("data", function (chunk) {
        body += chunk.toString();
    });
    
    request.on("end", async function () {
        try {
            const data = JSON.parse(body);
            if (!data.idActivity) {
                throw new BadRequestError("MissingActivityID", ["Debe especificar el ID de la actividad."]);
            }
            
            // El idUser viene del usuario autenticado actual (currentUser adjunto por el middleware de auth)
            const idUser = currentUser.IDuser;
            const idRegistration = registerMemberToActivityDB(idUser, data.idActivity);
            
            sendSuccess(response, {
                message: "Inscripción creada correctamente.",
                idRegistration: idRegistration
            }, 200);
        } catch (error) {
            sendError(response, error);
        }
    });
}

    //CANCELAR INSCRIPCION(permite al socio darse de baja de una actividad)
 function cancelRegistration(request, response, currentUser) {
    let body = "";
    
    request.on("data", function (chunk) {
        body += chunk.toString();
    });
    
    request.on("end", async function () {
        try {
            const data = JSON.parse(body);
            if (!data.idActivity) {
                throw new BadRequestError("MissingActivityID", ["Debe especificar el ID de la actividad."]);
            }
            
            const idUser = currentUser.IDuser;
            const changes = cancelRegistrationDB(idUser, data.idActivity);

            if (changes === 0) {
                throw new DomainError("RegistrationNotFound", ["No se encontró una inscripción activa para esta actividad."]);
            }
            
            sendSuccess(response, {
                message: "Inscripción cancelada correctamente"
            }, 200);
        } catch (error) {
            sendError(response, error);
        }
    });
}

// Listar inscripciones del usuario actual
function getMyEnrollments(request, response, currentUser) {
    try {
        const idUser = currentUser.IDuser;
        const enrollments = listUserEnrollmentsDB(idUser);

        sendSuccess(response, { enrollments: enrollments }, 200);
    } catch (error) {
        sendError(response, error);
    }
}

module.exports = {
    listActivities,
    createActivity,
    updateActivity,
    registerMemberToActivity,
    cancelRegistration,
    getMyEnrollments
};
