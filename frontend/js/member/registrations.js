import { RPCWebAPIFetchPrivate } from '../shared/api.js';
import { clearContainer, createActivityCard } from '../shared/domUtils.js';
import { loadActivities } from './activities.js'; // Para recargar los cupos al cancelar

export async function loadRegistrations() {
    const container = document.getElementById("registrationsContainer");
    clearContainer(container);

    try {
        const response = await RPCWebAPIFetchPrivate("/listMemberRegistrations", {});
        const registrations = response.data.registrations || [];

        if (registrations.length === 0) {
            const emptyP = document.createElement("p");
            emptyP.className = "empty-msg";
            emptyP.textContent = "Todavía no estás inscripto en ninguna actividad.";
            container.appendChild(emptyP);
            return;
        }

        const grid = document.createElement("div");
        grid.className = "activities-grid";

        for (let i = 0; i < registrations.length; i++) {
            const card = createActivityCard(registrations[i], {
                isRegistered: true
            });
            grid.appendChild(card);
        }

        container.appendChild(grid);

    } catch (error) {
        const errP = document.createElement("p");
        errP.className = "empty-msg";
        errP.textContent = "Error al cargar tus inscripciones: " + error.message;
        container.appendChild(errP);
    }
}

export async function onCancelRegisterClick(event) {
    const button = event.target.closest(".cancel-register-btn");
    if (!button) return;

    const activityId = parseInt(button.getAttribute("data-id"), 10);

    if (!confirm("¿Estás seguro que querés cancelar tu inscripción a esta actividad?")) return;

    button.disabled = true;
    button.innerText = "Cancelando...";

    try {
        const response = await RPCWebAPIFetchPrivate("/cancelRegistration", { idActivity: activityId });
        alert(response.data.message || "Inscripción cancelada correctamente.");
        
        loadActivities();
        loadRegistrations();
    } catch (error) {
        alert("Error al cancelar la inscripción: " + error.message);
        button.disabled = false;
        button.innerText = "Cancelar Inscripción";
    }
}