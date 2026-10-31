import { RPCWebAPIFetchPrivate } from '../shared/api.js';
import { clearContainer, createActivityCard } from '../shared/domUtils.js';
import { loadRegistrations } from './registrations.js'; // Para recargar las inscripciones al inscribirse

export async function loadActivities() {
    const container = document.getElementById("activitiesContainer");
    clearContainer(container);

    try {
        const response = await RPCWebAPIFetchPrivate("/listActiveActivities", {});
        const activities = response.data.activities || [];

        if (activities.length === 0) {
            const emptyP = document.createElement("p");
            emptyP.className = "empty-msg";
            emptyP.textContent = "No hay actividades cargadas.";
            container.appendChild(emptyP);
            return;
        }

        const grid = document.createElement("div");
        grid.className = "activities-grid";

        for (let i = 0; i < activities.length; i++) {
            const card = createActivityCard(activities[i], {
                showRegisterButton: true,
                showCapacity: true
            });
            grid.appendChild(card);
        }

        container.appendChild(grid);

    } catch (error) {
        const errP = document.createElement("p");
        errP.className = "empty-msg";
        errP.textContent = "Error al cargar actividades: " + error.message;
        container.appendChild(errP);
    }
}

export async function onRegisterClick(event) {
    const button = event.target.closest(".register-btn");
    if (!button) return;

    const activityId = parseInt(button.getAttribute("data-id"), 10);

    if (!confirm("¿Confirmás tu inscripción a esta actividad?")) return;

    button.disabled = true;
    button.innerText = "Inscribiendo...";

    try {
        const response = await RPCWebAPIFetchPrivate("/registerMemberToActivity", { idActivity: activityId });
        alert(response.data.message || "¡Inscripción exitosa!");
        
        loadActivities();   // Recarga cupos
        loadRegistrations();  // Recarga la lista de abajo
    } catch (error) {
        alert("Error al inscribirse: " + error.message);
        button.disabled = false;
        button.innerText = "Inscribirme";
    }
}