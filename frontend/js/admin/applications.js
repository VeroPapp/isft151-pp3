import { RPCWebAPIFetchPrivate } from '../shared/api.js';
import { showMessage } from '../shared/helpers.js';
import { clearContainer, createCell, createButton } from '../shared/domUtils.js';

export async function loadApplications() {
    // El módulo busca su propio contenedor
    const container = document.getElementById("applicationsContainer");
    clearContainer(container);

    try {
        const response = await RPCWebAPIFetchPrivate("/listMembershipApplications", {});
        const applications = response.data.applications || [];

        if (applications.length === 0) {
            const emptyP = document.createElement("p");
            emptyP.className = "empty-row";
            emptyP.textContent = response.data.message || "No hay solicitudes pendientes.";
            container.appendChild(emptyP);
            return;
        }

        const table = document.createElement("table");
        table.className = "data-table";

        const thead = document.createElement("thead");
        const trHead = document.createElement("tr");
        const headers = ["Nombre y Apellido", "DNI", "Email", "Teléfono", "Acciones"];
        for (let h = 0; h < headers.length; h++) {
            const th = document.createElement("th");
            th.textContent = headers[h];
            trHead.appendChild(th);
        }
        thead.appendChild(trHead);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        for (let i = 0; i < applications.length; i++) {
            const app = applications[i];
            const tr = document.createElement("tr");

            tr.appendChild(createCell(app.name + " " + app.surname, true));
            tr.appendChild(createCell(app.dni, false));
            tr.appendChild(createCell(app.email, false));
            tr.appendChild(createCell(app.phone, false));

            const tdActions = document.createElement("td");
            const divActions = document.createElement("div");
            divActions.className = "actions-cell";

            divActions.appendChild(createButton("Aprobar", "btn btn-success action-btn", {
                "data-action": "approve",
                "data-id": app.idUser
            }));
            divActions.appendChild(createButton("Rechazar", "btn btn-danger action-btn", {
                "data-action": "reject",
                "data-id": app.idUser
            }));

            tdActions.appendChild(divActions);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        container.appendChild(table);

    } catch (error) {
        const errP = document.createElement("p");
        errP.className = "empty-row";
        errP.textContent = "Error al cargar solicitudes: " + error.message;
        container.appendChild(errP);
    }
}

// Ahora solo recibe el evento (e) para cumplir con la firma de onclick
export async function onApplicationActionClick(event) {
    const button = event.target.closest(".action-btn");
    if (!button) return;

    const action = button.getAttribute("data-action");
    const idUser = button.getAttribute("data-id");

    if (action === "approve") {
        if (!confirm("¿Confirmás que querés aprobar esta solicitud?")) return;
        button.disabled = true;
        try {
            const response = await RPCWebAPIFetchPrivate("/approveMembershipApplication", { idUser: idUser });
            showMessage("resultMessage", response.data.message, false);
            loadApplications(); // Llama a la función sin argumentos
        } catch (error) {
            showMessage("resultMessage", "Error al aprobar: " + error.message, true);
            button.disabled = false;
        }
    } else if (action === "reject") {
        if (!confirm("¿Confirmás que querés rechazar esta solicitud?")) return;
        button.disabled = true;
        try {
            const response = await RPCWebAPIFetchPrivate("/rejectMembershipApplication", { idUser: idUser });
            showMessage("resultMessage", response.data.message, false);
            loadApplications();
        } catch (error) {
            showMessage("resultMessage", "Error al rechazar: " + error.message, true);
            button.disabled = false;
        }
    }
}