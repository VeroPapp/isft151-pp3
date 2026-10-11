const { InternServerError, BadRequestError, UnauthorizedError, DomainError, sendError } = require("../helpers/errorHandler.js")
const { createMembershipApplicationDB } = require("../models/membership.js");
const { sendSuccess } = require("../helpers/responseHandler.js")

async function createMembershipApplication(request, response) {

    let body = ""

    request.on("data", chunk => {
        body += chunk.toString()
    })

    request.on("end", async () => {
        try {

            // si el body esta vacio, lanza un error de especificación
            if (!body) {
                const error = new BadRequestError("El cuerpo de la petición no puede estar vacío.")
                throw error
            }

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


function listMembershipApplications(request, response) { }

function approveMembershipApplication(request, response) { }

function rejectMembershipApplication(request, response) { }



module.exports = {
    createMembershipApplication
};