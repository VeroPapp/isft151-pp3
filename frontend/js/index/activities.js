import { RPCWebAPIFetchPublic } from '../shared/api.js';
import { clearContainer, createActivityCard } from '../shared/domUtils.js';

export async function loadActivities() {
    // El módulo busca su propio contenedor
    const container = document.getElementById("activitiesContainer");
    clearContainer(container);

    try {
        const response = await RPCWebAPIFetchPublic("/listActiveActivities", {});
        const activities = response.data.activities || [];

        if (activities.length === 0) {
            const emptyP = document.createElement("p");
            emptyP.className = "landing-empty";
            emptyP.textContent = response.data.message || "No hay actividades cargadas todavía.";
            container.appendChild(emptyP);
            return;
        }

        for (let i = 0; i < activities.length; i++) {
            const card = createActivityCard(activities[i], {
                showRegisterButton: false,
                showCapacity: false
            });
            
            container.appendChild(card);
        }

    } catch (error) {
        clearContainer(container);
        const errorP = document.createElement("p");
        errorP.className = "landing-empty";
        errorP.textContent = "No se pudieron cargar las actividades: " + error.message;
        container.appendChild(errorP);
        console.error("[activities]", error);
    }
}