import { RPCWebAPIFetchPrivate } from '../shared/api.js';
import { handleLogout } from '../shared/helpers.js';

import { loadApplications, onApplicationActionClick } from './applications.js';
import { loadActivities, onActivityActionClick, onCreateActivitySubmit, resetActivityForm, createScheduleRow, onRemoveMemberFromActivity } from './activities.js';
import { loadMembers, onMemberActionClick, onEditMemberSubmit } from './members.js';

if (!localStorage.getItem("accessToken")) {
    window.location.href = "login.html";
}

// --- Configuración de Tabs ---
function setupTabs() {
    const tabs = document.querySelectorAll(".tab");
    const panels = document.querySelectorAll(".tab-panel");

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            tabs.forEach(function (t) { t.classList.remove("active"); });
            panels.forEach(function (p) { p.classList.remove("active"); });
            tab.classList.add("active");
            document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
        });
    });
}

function main() {
    // 1. Cerrar sesión
    document.getElementById("logoutButton").onclick = function () {
        handleLogout(RPCWebAPIFetchPrivate);
    };

    // 2. Asignación directa de eventos (igual que en tu ejemplo)
    document.getElementById("applicationsContainer").onclick = onApplicationActionClick;
    document.getElementById("activitiesContainer").onclick = onActivityActionClick;
    document.getElementById("membersContainer").onclick = onMemberActionClick;
    
    // 3. Formularios
    document.getElementById("createActivityForm").onsubmit = onCreateActivitySubmit;
    document.getElementById("cancelEditBtn").onclick = resetActivityForm;
    document.getElementById("editMemberForm").onsubmit = onEditMemberSubmit;

    // 4. Botones de horarios y modales
    document.getElementById("addScheduleBtn").onclick = function () {
        document.getElementById("schedulesContainer").appendChild(createScheduleRow(null));
    };

    document.getElementById("closeModalBtn").onclick = function () {
        document.getElementById("registrationsModal").style.display = "none";
    };
    
    document.getElementById("registrationsModal").addEventListener("click", function (e) {
        if (e.target === this) this.style.display = "none";
    });

    document.getElementById("modalRegistrationsBody").onclick = onRemoveMemberFromActivity;

    document.getElementById("closeEditMemberBtn").onclick = function () {
        document.getElementById("editMemberModal").style.display = "none";
    };
    
    document.getElementById("editMemberModal").addEventListener("click", function (e) {
        if (e.target === this) this.style.display = "none";
    });

    // 5. Carga inicial
    resetActivityForm();
    setupTabs();
    loadApplications();
    loadActivities();
    loadMembers();
}

window.onload = main;