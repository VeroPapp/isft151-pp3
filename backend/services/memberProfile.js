const { sendSuccess } = require("../helpers/responseHandler.js");
const { sendError, BadRequestError, UnauthorizedError, DomainError } = require("../helpers/errorHandler.js");
const { getMemberByIdDB, updatePhoneDB } = require("../models/member.js");

function getMemberProfile(request, response) {
    try {
        const member = getMemberByIdDB(request.user.idUser);
        if (!member) {
            throw new BadRequestError("Usuario no encontrado.");
        }

        const { password, sessionKey, idRole, idStatus, ...profile } = member;

        sendSuccess(response, { profile: profile }, 200);

    } catch (error) {
        sendError(response, error);
    }

}

function updateMemberProfile(request, response) {
    let bodyRaw = "";

    request.on("data", function(chunk) {
        bodyRaw += chunk.toString();
    });

    request.on("end", async function () {
        try {
            let data;
            try {
                data = JSON.parse(bodyRaw);
            } catch (error) {
                throw new BadRequestError("El cuerpo de la petición debe contener un JSON válido.");
            }

            const { phone } = data

            if (!phone) {
                throw new BadRequestError("Se requiere campo obligatorio.")
            }

            const member = getMemberByIdDB(request.user.idUser);
            if (!member) {
                throw new BadRequestError("Usuario no encontrado.");
            }

            const result = updatePhoneDB(phone, request.user.idUser);
            if (!result) {
                throw new DomainError("No se pudo actualizar el miembro en el sistema.");
            }

            sendSuccess(response, { message: "Perfil actualizado correctamente." }, 200);

        } catch (error) {
            sendError(response, error);
        }
    })
}


module.exports = {
    getMemberProfile,
    updateMemberProfile
}