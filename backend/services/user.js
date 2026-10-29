const { sendSuccess } = require("../helpers/responseHandler.js");
const { sendError, BadRequestError, UnauthorizedError, DomainError } = require("../helpers/errorHandler.js");
const { getUserByIdDB, listMembersDB, updateMemberDB, updatePhoneDB, changeMemberStatusDB} = require("../models/user.js");
const { getStatusByIdDB } = require("../models/status.js");
const { getRoleByIdDB } = require("../models/roles.js");

// ==========================================
// ADMINISTRADORES (CLUB_ADMIN / SUPER_ADMIN)
// ==========================================

function getMember(request, response) {
    let bodyRaw = "";

    request.on('data', chunk => {
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

            const { idUser } = data
            if (!idUser) {
                throw new BadRequestError("Se require un ID usuario.")
            }

            const member = getUserByIdDB(idUser);
            if (!member) {
                throw new BadRequestError("Usuario no encontrado.");
            }

            const status = getStatusByIdDB(member.idStatus)

            const { password, sessionKey, idRole, idStatus, ...profile } = member;
            profile.active = status.nameStatus === "ACTIVE" ? 1 : 0;

            sendSuccess(response, { profile: profile }, 200);

        } catch (error) {
            sendError(response, error);
        }
    })
}

function listMembers(request, response) {
    try {
        const members = listMembersDB();

        if (members.length === 0) {
            sendSuccess(response, {
                message: "No hay miembros registrados todavía.",
                members: []
            }, 200);
            return;
        }

        sendSuccess(response, { members: members }, 200);
    } catch (error) {
        sendError(response, error);
    }
}

function updateMember(request, response) {

    let bodyRaw = "";

    request.on('data', chunk => {
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

            const { idUser, name, surname, dni, birthdate, phone, email } = data

            if (!idUser || !name || !surname || !dni || !birthdate || !phone || !email) {
                throw new BadRequestError("Se requiren campos obligatorios.")
            }

            const member = getUserByIdDB(idUser);
            if (!member) {
                throw new BadRequestError("Usuario no encontrado.");
            }

            const roleMember = getRoleByIdDB(member.idRole)
            if (roleMember.nameRole !== "MEMBER") {
                throw new DomainError("No se puede actualizar un usuario que no tiene el rol MEMBER.")
            }

            const result = updateMemberDB(name, surname, dni, birthdate, phone, email, idUser);
            if (!result) {
                throw new DomainError("No se pudo actualizar el miembro en el sistema.");
            }

            sendSuccess(response, { message: "Datos del socio actualizados correctamente." }, 200);


        } catch (error) {
            sendError(response, error);
        }
    })

}

function deactivateMember(request, response) {
    let bodyRaw = "";

    request.on('data', chunk => {
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

            const { idUser } = data

            if (!idUser) {
                throw new BadRequestError("Se require campo obligatorio.")
            }

            const member = getUserByIdDB(idUser);
            if (!member) {
                throw new BadRequestError("Usuario no encontrado.");
            }

            const roleMember = getRoleByIdDB(member.idRole)
            if (roleMember.nameRole !== "MEMBER") {
                throw new DomainError("No se puede desactivar un usuario que no tiene el rol MEMBER.")
            }

            // cambia el estado a "INACTIVE"
            const INACTIVE = 5
            const result = changeMemberStatusDB(INACTIVE, idUser);
            if (!result) {
                throw new DomainError("No se pudo desactivar la membresía de un socio.");
            }

            sendSuccess(response, { message: "Socio dado de baja correctamente." }, 200);


        } catch (error) {
            sendError(response, error);
        }
    })
}

function activateMember(request, response) {
    let bodyRaw = "";

    request.on('data', chunk => {
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

            const { idUser } = data

            if (!idUser) {
                throw new BadRequestError("Se requiere el ID del usuario.");
            }

            const member = getUserByIdDB(idUser);
            if (!member) {
                throw new BadRequestError("Usuario no encontrado.");
            }

            const roleMember = getRoleByIdDB(member.idRole)
            if (roleMember.nameRole !== "MEMBER") {
                throw new DomainError("No se puede activar un usuario que no tiene el rol MEMBER.");
            }

            // Cambia el estado a "ACTIVE" (3)
            const ACTIVE = 3
            const result = changeMemberStatusDB(ACTIVE, idUser); // Reutilizamos la función que ya hace el UPDATE
            if (!result) {
                throw new DomainError("No se pudo reactivar la membresía del socio.");
            }

            sendSuccess(response, { message: "Socio reactivado correctamente." }, 200);

        } catch (error) {
            sendError(response, error);
        }
    })
}


// ==========================================
// SOCIOS (MEMBER)
// ==========================================

function getMemberProfile(request, response) {
    try {

        const member = getUserByIdDB(request.user.IDuser);
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

    request.on('data', chunk => {
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
                throw new BadRequestError("Se require campo obligatorio.")
            }

            const member = getUserByIdDB(request.user.IDuser);
            if (!member) {
                throw new BadRequestError("Usuario no encontrado.");
            }

            const result = updatePhoneDB(phone, request.user.IDuser);
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
    getMember, 
    listMembers, 
    updateMember, 
    deactivateMember,
    activateMember, 
    getMemberProfile, 
    updateMemberProfile 
}