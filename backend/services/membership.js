const { ErrorAuthentication, ErrorDomain, ErrorInternServer, ErrorSpecification } = require("../helpers/errorHandler.js")
const { authorize } = require("../models/auth.js")
const {createMembershipApplicationDB, assignMemberRolePendingDB} = require("../models/membership.js");

async function createMembershipApplication(request, response) {

    let body = ""

    request.on("data", chunk => {
        body += chunk.toString()
    })

    request.on("end", async () => {
        try {
            // si el body esta vacio, lanza un error de especificación
            if (!body) {
                const error = new ErrorSpecification()
                throw error
            }

            request.body = JSON.parse(body)

            // Extrae los datos del body
            const {name, surname, dni, birthdate, email, phone} = request.body

            // Validación de datos de entrada
            if (!name || !surname || !dni || !birthdate || !email || !phone) {
                const error = new ErrorSpecification()
                throw error
            }

            const userId = await createMembershipApplicationDB(name, surname, dni, birthdate, email, phone)

            response.writeHead(200, {
                "Content-Type": "application/json"
            })

            response.end(JSON.stringify({
                message: "Solicitud enviada correctamente. Pronto nos comunicaremos vía mail."
            }))

        } catch (error) {

            const type = error.type || "ErrorInternServer"
            let message = null
            let code = null

            switch (type) {

                case "ErrorSpecification":
                    message = error.getMessage()
                    code = error.getCode()
                    break

                case "ErrorDomain":
                    message = error.getMessage()
                    code = error.getCode()
                    break

                case "ErrorInternServer":
                    message = error.message
                    code = 500
                    break
            }

            response.writeHead(code, {
                "Content-Type": "application/json"
            })

            response.end(JSON.stringify(message))
        }
    })
}


function listMembershipApplications(request, response) {}

function approveMembershipApplication(request, response) {}

function rejectMembershipApplication(request, response) {}



module.exports = {
    createMembershipApplication
};