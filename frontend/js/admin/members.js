import { RPCWebAPIFetchPrivate } from '../shared/api.js';
import { formatDate, showMessage, getStatusBadge } from '../shared/helpers.js';
import { clearContainer, createCell, createButton } from '../shared/domUtils.js';

let localMembersData = [];

export async function loadMembers() {
    const container = document.getElementById("membersContainer");
    clearContainer(container);

    try {
        const response = await RPCWebAPIFetchPrivate("/listMembers", {});
        localMembersData = response.data.members || [];

        if (localMembersData.length === 0) {
            const emptyP = document.createElement("p");
            emptyP.className = "empty-row";
            emptyP.textContent = response.data.message || "No hay miembros registrados.";
            container.appendChild(emptyP);
            return;
        }

        const table = document.createElement("table");
        table.className = "data-table";

        const thead = document.createElement("thead");
        const trHead = document.createElement("tr");
        const headers = ["Nombre y Apellido", "DNI", "Email", "Teléfono", "Estado", "Alta", "Acciones"];
        for (let h = 0; h < headers.length; h++) {
            const th = document.createElement("th");
            th.textContent = headers[h];
            trHead.appendChild(th);
        }
        thead.appendChild(trHead);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        for (let i = 0; i < localMembersData.length; i++) {
            const m = localMembersData[i];
            const tr = document.createElement("tr");

            tr.appendChild(createCell(m.name + " " + m.surname, true));
            tr.appendChild(createCell(m.dni, false));
            tr.appendChild(createCell(m.email, false));
            tr.appendChild(createCell(m.phone, false));

            const tdStatus = document.createElement("td");
            tdStatus.innerHTML = getStatusBadge(m.status);
            tr.appendChild(tdStatus);

            tr.appendChild(createCell(formatDate(m.creationDate), false));

            const tdActions = document.createElement("td");
            const divActions = document.createElement("div");
            divActions.className = "actions-cell";

            divActions.appendChild(createButton("Editar", "btn btn-warning edit-member-btn", { "data-id": m.idUser }));

            if (m.status === "INACTIVE") {
                divActions.appendChild(createButton("Reactivar", "btn btn-success activate-member-btn", { "data-id": m.idUser }));
            } else {
                divActions.appendChild(createButton("Dar de baja", "btn btn-danger deactivate-member-btn", { "data-id": m.idUser }));
            }

            tdActions.appendChild(divActions);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        container.appendChild(table);

    } catch (error) {
        const errP = document.createElement("p");
        errP.className = "empty-row";
        errP.textContent = "Error al cargar miembros: " + error.message;
        container.appendChild(errP);
    }
}

export async function onMemberActionClick(event) {
    const editBtn = event.target.closest(".edit-member-btn");
    const deactivateBtn = event.target.closest(".deactivate-member-btn");
    const activateBtn = event.target.closest(".activate-member-btn");

    if (editBtn) {
        const idUser = editBtn.getAttribute("data-id");
        const member = localMembersData.find(function (m) { return m.idUser == idUser; });
        if (member) openEditMemberModal(member);
        return;
    }

    if (deactivateBtn) {
        if (!confirm("¿Estás seguro que querés dar de baja a este socio?")) return;
        deactivateBtn.disabled = true;
        deactivateBtn.textContent = "Procesando...";
        try {
            const response = await RPCWebAPIFetchPrivate("/deactivateMember", { idUser: deactivateBtn.getAttribute("data-id") });
            showMessage("resultMessage", response.data.message || "Socio dado de baja.", false);
            loadMembers();
        } catch (error) {
            showMessage("resultMessage", "Error al dar de baja: " + error.message, true);
            deactivateBtn.disabled = false;
            deactivateBtn.textContent = "Dar de baja";
        }
        return;
    }

    if (activateBtn) {
        if (!confirm("¿Querés reactivar a este socio?")) return;
        activateBtn.disabled = true;
        activateBtn.textContent = "Procesando...";
        try {
            const response = await RPCWebAPIFetchPrivate("/activateMember", { idUser: activateBtn.getAttribute("data-id") });
            showMessage("resultMessage", response.data.message || "Socio reactivado.", false);
            loadMembers();
        } catch (error) {
            showMessage("resultMessage", "Error al reactivar: " + error.message, true);
            activateBtn.disabled = false;
            activateBtn.textContent = "Reactivar";
        }
        return;
    }
}

export function openEditMemberModal(member) {
    document.getElementById("editMemberId").value = member.idUser;
    document.getElementById("editMemberName").value = member.name;
    document.getElementById("editMemberSurname").value = member.surname;
    document.getElementById("editMemberDni").value = member.dni;

    const fechaNac = member.birthdate ? member.birthdate.split(" ")[0] : "";
    document.getElementById("editMemberBirthdate").value = fechaNac;

    document.getElementById("editMemberEmail").value = member.email;
    document.getElementById("editMemberPhone").value = member.phone;

    document.getElementById("editMemberTitle").textContent = "Editar Socio: " + member.name + " " + member.surname;
    document.getElementById("editMemberModal").style.display = "flex";
}

// Recibe el evento directamente
export async function onEditMemberSubmit(event) {
    event.preventDefault();
    const btn = document.getElementById("saveEditMemberBtn");

    const payload = {
        idUser: parseInt(document.getElementById("editMemberId").value, 10),
        name: document.getElementById("editMemberName").value.trim(),
        surname: document.getElementById("editMemberSurname").value.trim(),
        dni: document.getElementById("editMemberDni").value.trim(),
        birthdate: document.getElementById("editMemberBirthdate").value,
        email: document.getElementById("editMemberEmail").value.trim(),
        phone: document.getElementById("editMemberPhone").value.trim()
    };

    btn.disabled = true;
    btn.textContent = "Guardando...";

    try {
        const response = await RPCWebAPIFetchPrivate("/updateMember", payload);
        document.getElementById("editMemberModal").style.display = "none";
        showMessage("resultMessage", response.data.message || "Socio actualizado correctamente.", false);
        loadMembers();
    } catch (error) {
        showMessage("resultMessage", "Error al actualizar: " + error.message, true);
    } finally {
        btn.disabled = false;
        btn.textContent = "Guardar Cambios";
    }
}