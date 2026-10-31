import { RPCWebAPIFetchPrivate } from '../shared/api.js';
import { handleLogout } from '../shared/helpers.js';

import { loadProfile, onEditPhoneClick } from './profile.js';
import { loadActivities, onRegisterClick } from './activities.js';
import { loadRegistrations, onCancelRegisterClick } from './registrations.js';
import { onDeactivateMembershipClick } from './membership.js';

if (!localStorage.getItem("accessToken")) {
    window.location.href = "login.html";
}

function main() {
    // 1. Header actions
    document.getElementById("logoutButton").onclick = function () {
        handleLogout(RPCWebAPIFetchPrivate);
    };
    document.getElementById("deactivateMembershipButton").onclick = onDeactivateMembershipClick;

    // 2. Delegación de eventos para los contenedores
    document.getElementById("activitiesContainer").onclick = onRegisterClick;
    document.getElementById("registrationsContainer").onclick = onCancelRegisterClick;

    // 3. Evento para el botón de editar teléfono (Delegación)
    document.getElementById("profileContainer").onclick = function (event) {
        if (event.target.id === "editPhoneBtn") {
            onEditPhoneClick();
        }
    };

    // 4. Carga inicial de datos
    loadProfile();
    loadActivities();
    loadRegistrations();
}

window.onload = main;