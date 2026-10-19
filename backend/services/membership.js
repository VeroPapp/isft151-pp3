const { InternServerError, BadRequestError, UnauthorizedError, DomainError, sendError } = require("../helpers/errorHandler.js")
const { createMembershipApplicationDB, listMembershipApplicationsDB, approveMembershipApplicationDB, rejectMembershipApplicationDB } = require("../models/membership.js");
const { sendSuccess } = require("../helpers/responseHandler.js")

async function createMembershipApplication(request, response) {

    let body = ""

    request.on("data", chunk => {
        body += chunk.toString()
    })

    request.on("end", async () => {
        try {

            const data = JSON.parse(body)

            // Extrae los datos del body
            const { name, surname, dni, birthdate, email, phone } = data

            // Validación de datos de entrada
            if (!name || !surname || !dni || !birthdate || !email || !phone) {
                const error = new BadRequestError("Faltan campos obligatorios para realizar la solicitud de membresia")
                throw error
            }

            const userId = createMembershipApplicationDB(name, surname, dni, birthdate, email, phone)

            if (!userId) {
                const error = new DomainError("El numero de DNI o email ya está registrado en el sistema.")
                throw error
            }

            const message = { message: "Solicitud enviada correctamente. Pronto nos comunicaremos vía mail." }

            sendSuccess(response, message, 201)

        } catch (error) {

            sendError(response, error)
        }
    })
}


function listMembershipApplications(request, response) {
    try {
        const applications = listMembershipApplicationsDB();

        if (!applications || applications.length === 0) {
            sendSuccess(response, {
                message: "No hay solicitudes de membresía pendientes.",
                applications: []
            }, 200);
            return;
        }

        sendSuccess(response, { applications }, 200);

    } catch (error) {
        sendError(response, error);
    }
}

function approveMembershipApplication(request, response) {
    let bodyRaw = "";

    request.on("data", chunk => {
        bodyRaw += chunk.toString();
    });

    request.on("end", () => {
        try {
            const data = JSON.parse(bodyRaw);
            const { idUser } = data;

            if (!idUser) {
                throw new BadRequestError("Falta el idUser de la solicitud a aprobar.");
            }

            const ok = approveMembershipApplicationDB(idUser);

            if (!ok) {
                throw new DomainError("No se encontró una solicitud pendiente con ese ID, o ya fue procesada.");
            }

            sendSuccess(response, { message: "Solicitud aprobada. El usuario deberá cambiar su contraseña en el próximo login." }, 200);

        } catch (error) {
            sendError(response, error);
        }
    });
}

function rejectMembershipApplication(request, response) {
    let bodyRaw = "";

    request.on("data", chunk => {
        bodyRaw += chunk.toString();
    });

    request.on("end", () => {
        try {
            const data = JSON.parse(bodyRaw);
            const { idUser } = data;

            if (!idUser) {
                throw new BadRequestError("Falta el idUser de la solicitud a rechazar.");
            }

            const ok = rejectMembershipApplicationDB(idUser);

            if (!ok) {
                throw new DomainError("No se encontró una solicitud pendiente con ese ID, o ya fue procesada.");
            }

            sendSuccess(response, { message: "Solicitud rechazada correctamente." }, 200);

        } catch (error) {
            sendError(response, error);
        }
    });
}


module.exports = {
    createMembershipApplication,
    listMembershipApplications,
    approveMembershipApplication,
    rejectMembershipApplication
};