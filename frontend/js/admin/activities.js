import { RPCWebAPIFetchPrivate } from '../shared/api.js';
import { showMessage } from '../shared/helpers.js';
import { clearContainer, createCell, createButton } from '../shared/domUtils.js';

let localActivitiesData = [];

export async function loadActivities() {
    const container = document.getElementById("activitiesContainer");
    clearContainer(container);

    try {
        const response = await RPCWebAPIFetchPrivate("/listAllActivities", {});
        localActivitiesData = response.data.activities || [];

        if (localActivitiesData.length === 0) {
            const emptyP = document.createElement("p");
            emptyP.className = "empty-row";
            emptyP.textContent = response.data.message || "No hay actividades cargadas.";
            container.appendChild(emptyP);
            return;
        }

        const table = document.createElement("table");
        table.className = "data-table";
        const thead = document.createElement("thead");
        const trHead = document.createElement("tr");
        const headers = ["Nombre", "Horarios", "Instructor", "Inscriptos", "Estado", "Acciones"];
        
        for (let h = 0; h < headers.length; h++) {
            const th = document.createElement("th");
            th.textContent = headers[h];
            trHead.appendChild(th);
        }
        thead.appendChild(trHead);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        for (let i = 0; i < localActivitiesData.length; i++) {
            const act = localActivitiesData[i];
            const tr = document.createElement("tr");

            tr.appendChild(createCell(act.name, true));

            const tdSchedules = document.createElement("td");
            for (let j = 0; j < act.schedules.length; j++) {
                const s = act.schedules[j];
                tdSchedules.appendChild(document.createTextNode(s.day + " " + s.startTime + "-" + s.endTime));
                if (j < act.schedules.length - 1) tdSchedules.appendChild(document.createElement("br"));
            }
            tr.appendChild(tdSchedules);

            tr.appendChild(createCell("Prof. " + (act.instructor || "—"), false));

            let cupoTexto = "—";
            if (act.capacity) {
                const disponibles = (act.availablePlaces !== undefined && act.availablePlaces !== null) ? act.availablePlaces : act.capacity;
                const inscriptos = act.capacity - disponibles;
                cupoTexto = inscriptos + " / " + act.capacity;
            }
            tr.appendChild(createCell(cupoTexto, false));

            const tdStatus = document.createElement("td");
            const badge = document.createElement("span");
            badge.className = act.status === "ACTIVE" ? "badge badge-active" : "badge badge-inactive";
            badge.textContent = act.status === "ACTIVE" ? "Activa" : "Inactiva";
            tdStatus.appendChild(badge);
            tr.appendChild(tdStatus);

            const tdActions = document.createElement("td");
            const divActions = document.createElement("div");
            divActions.className = "actions-cell";

            divActions.appendChild(createButton("Ver Inscriptos", "btn btn-success view-registrations-btn", {
                "data-id": act.idActivity,
                "data-name": act.name
            }));
            divActions.appendChild(createButton("Editar", "btn btn-warning edit-btn", { "data-id": act.idActivity }));

            if (act.status === "ACTIVE") {
                divActions.appendChild(createButton("Dar de baja", "btn btn-danger deactivate-btn", { "data-id": act.idActivity }));
            } else {
                divActions.appendChild(createButton("Activar", "btn btn-success activate-btn", { "data-id": act.idActivity }));
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
        errP.textContent = "Error al cargar actividades: " + error.message;
        container.appendChild(errP);
    }
}

export async function onActivityActionClick(event) {
    const viewBtn = event.target.closest(".view-registrations-btn");
    const deactivateBtn = event.target.closest(".deactivate-btn");
    const activateBtn = event.target.closest(".activate-btn");
    const editBtn = event.target.closest(".edit-btn");

    if (viewBtn) {
        openRegistrationsModal(viewBtn.getAttribute("data-id"), viewBtn.getAttribute("data-name"));
        return;
    }

    if (deactivateBtn) {
        if (!confirm("¿Estás seguro que querés dar de baja esta actividad?")) return;
        deactivateBtn.disabled = true;
        deactivateBtn.textContent = "Procesando...";
        try {
            const response = await RPCWebAPIFetchPrivate("/deactivateActivity", { idActivity: deactivateBtn.getAttribute("data-id") });
            showMessage("resultMessage", response.data.message, false);
            loadActivities();
        } catch (error) {
            showMessage("resultMessage", "Error al dar de baja: " + error.message, true);
            deactivateBtn.disabled = false;
            deactivateBtn.textContent = "Dar de baja";
        }
        return;
    }

    if (activateBtn) {
        if (!confirm("¿Querés volver a activar esta actividad?")) return;
        activateBtn.disabled = true;
        activateBtn.textContent = "Procesando...";
        try {
            const response = await RPCWebAPIFetchPrivate("/activateActivity", { idActivity: activateBtn.getAttribute("data-id") });
            showMessage("resultMessage", response.data.message, false);
            loadActivities();
        } catch (error) {
            showMessage("resultMessage", "Error al activar: " + error.message, true);
            activateBtn.disabled = false;
            activateBtn.textContent = "Activar";
        }
        return;
    }

    if (editBtn) {
        const idActivity = parseInt(editBtn.getAttribute("data-id"), 10);
        const activity = localActivitiesData.find(function (a) { return a.idActivity === idActivity; });
        if (!activity) return;

        document.getElementById("editActivityId").value = activity.idActivity;
        document.getElementById("activityName").value = activity.name;
        document.getElementById("activityInstructor").value = activity.instructor || "";
        document.getElementById("activityCapacity").value = activity.capacity || "";
        document.getElementById("activityScope").value = activity.scope || "General";
        document.getElementById("activityDescription").value = activity.description || "";
        document.getElementById("activityStartDate").value = activity.startDate || "";
        document.getElementById("activityEndDate").value = activity.endDate || "";

        const schedulesContainer = document.getElementById("schedulesContainer");
        clearContainer(schedulesContainer);

        if (activity.schedules && activity.schedules.length > 0) {
            for (let i = 0; i < activity.schedules.length; i++) {
                schedulesContainer.appendChild(createScheduleRow(activity.schedules[i]));
            }
        }

        document.getElementById("activityFormTitle").textContent = "Editando Actividad: " + activity.name;
        document.getElementById("submitActivityButton").textContent = "Guardar Cambios";
        document.getElementById("submitActivityButton").classList.remove("btn-success");
        document.getElementById("submitActivityButton").classList.add("btn-warning");
        document.getElementById("cancelEditBtn").style.display = "inline-block";

        document.querySelector(".tab-panel.active").scrollIntoView({ behavior: 'smooth' });
    }
}

export function createScheduleRow(schedule) {
    const row = document.createElement("div");
    row.className = "schedule-row";

    const select = document.createElement("select");
    select.className = "sched-day";
    select.required = true;
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const optEmpty = document.createElement("option");
    optEmpty.value = "";
    optEmpty.textContent = "Día...";
    select.appendChild(optEmpty);

    for (let d = 0; d < days.length; d++) {
        const opt = document.createElement("option");
        opt.textContent = days[d];
        if (schedule && schedule.day === days[d]) opt.selected = true;
        select.appendChild(opt);
    }
    row.appendChild(select);

    const inputStart = document.createElement("input");
    inputStart.type = "time";
    inputStart.className = "sched-start";
    inputStart.required = true;
    if (schedule && schedule.startTime) inputStart.value = schedule.startTime;
    row.appendChild(inputStart);

    const span = document.createElement("span");
    span.textContent = "a";
    row.appendChild(span);

    const inputEnd = document.createElement("input");
    inputEnd.type = "time";
    inputEnd.className = "sched-end";
    inputEnd.required = true;
    if (schedule && schedule.endTime) inputEnd.value = schedule.endTime;
    row.appendChild(inputEnd);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-remove";
    removeBtn.textContent = "X";
    removeBtn.onclick = function () { row.remove(); };
    row.appendChild(removeBtn);

    return row;
}

export async function onCreateActivitySubmit(event) {
    event.preventDefault();
    const button = document.getElementById("submitActivityButton");
    const editId = document.getElementById("editActivityId").value;
    const isEditing = editId !== "";

    const scheduleRows = document.querySelectorAll(".schedule-row");
    const schedules = [];

    for (let i = 0; i < scheduleRows.length; i++) {
        const row = scheduleRows[i];
        const day = row.querySelector(".sched-day").value;
        const start = row.querySelector(".sched-start").value;
        const end = row.querySelector(".sched-end").value;
        if (day && start && end) schedules.push({ day: day, startTime: start, endTime: end });
    }

    if (schedules.length === 0) {
        showMessage("resultMessage", "Debes agregar al menos un horario válido.", true);
        return;
    }

    const payload = {
        name: document.getElementById("activityName").value.trim(),
        instructor: document.getElementById("activityInstructor").value.trim() || null,
        capacity: document.getElementById("activityCapacity").value || null,
        scope: document.getElementById("activityScope").value,
        description: document.getElementById("activityDescription").value.trim() || null,
        startDate: document.getElementById("activityStartDate").value || null,
        endDate: document.getElementById("activityEndDate").value || null,
        schedules: schedules
    };

    if (isEditing) payload.idActivity = parseInt(editId, 10);

    button.disabled = true;
    button.textContent = isEditing ? "Guardando..." : "Creando...";

    try {
        const endpoint = isEditing ? "/updateActivity" : "/createActivity";
        const response = await RPCWebAPIFetchPrivate(endpoint, payload);
        showMessage("resultMessage", response.data.message, false);
        resetActivityForm();
        loadActivities();
    } catch (error) {
        showMessage("resultMessage", (isEditing ? "Error al actualizar: " : "Error al crear: ") + error.message, true);
    } finally {
        button.disabled = false;
    }
}

export function resetActivityForm() {
    document.getElementById("createActivityForm").reset();
    document.getElementById("editActivityId").value = "";

    document.getElementById("activityFormTitle").textContent = "Nueva Actividad";
    document.getElementById("submitActivityButton").textContent = "Crear Actividad";
    document.getElementById("submitActivityButton").classList.remove("btn-warning");
    document.getElementById("submitActivityButton").classList.add("btn-success");
    document.getElementById("cancelEditBtn").style.display = "none";

    const container = document.getElementById("schedulesContainer");
    clearContainer(container);
    container.appendChild(createScheduleRow(null));
}

// --- Modal de Inscriptos ---
async function openRegistrationsModal(idActivity, activityName) {
    const modal = document.getElementById("registrationsModal");
    const title = document.getElementById("modalTitle");
    const tbody = document.getElementById("modalRegistrationsBody");

    title.textContent = "Inscriptos en: " + activityName;
    clearContainer(tbody);

    const loadingTr = document.createElement("tr");
    const loadingTd = document.createElement("td");
    loadingTd.setAttribute("colspan", "4");
    loadingTd.style.textAlign = "center";
    loadingTd.style.padding = "20px";
    loadingTd.textContent = "Cargando...";
    loadingTr.appendChild(loadingTd);
    tbody.appendChild(loadingTr);

    modal.style.display = "flex";

    try {
        const response = await RPCWebAPIFetchPrivate("/listRegistrationsByActivity", { idActivity: parseInt(idActivity, 10) });
        const regs = response.data.registrations || [];

        clearContainer(tbody);

        if (regs.length === 0) {
            const emptyTr = document.createElement("tr");
            const emptyTd = document.createElement("td");
            emptyTd.setAttribute("colspan", "4");
            emptyTd.style.textAlign = "center";
            emptyTd.style.padding = "20px";
            emptyTd.style.fontStyle = "italic";
            emptyTd.textContent = "No hay inscriptos aún.";
            emptyTr.appendChild(emptyTd);
            tbody.appendChild(emptyTr);
            return;
        }

        for (let i = 0; i < regs.length; i++) {
            const r = regs[i];
            const tr = document.createElement("tr");
            tr.appendChild(createCell(r.name + " " + r.surname, true));
            tr.appendChild(createCell(r.dni, false));
            tr.appendChild(createCell(r.email, false));

            const actionCell = document.createElement("td");
            const removeButton = createButton("Quitar de actividad", "btn btn-danger remove-registration-btn", {
                "data-user-id": r.idUser,
                "data-activity-id": idActivity
            });

            actionCell.appendChild(removeButton);
            tr.appendChild(actionCell);
            tbody.appendChild(tr);
        }
    } catch (error) {
        clearContainer(tbody);
        const errTr = document.createElement("tr");
        const errTd = document.createElement("td");
        errTd.setAttribute("colspan", "4");
        errTd.style.textAlign = "center";
        errTd.style.color = "red";
        errTd.style.padding = "20px";
        errTd.textContent = "Error: " + error.message;
        errTr.appendChild(errTd);
        tbody.appendChild(errTr);
    }
}

export async function onRemoveMemberFromActivity(event) {
    const button = event.target.closest(".remove-registration-btn");
    if (!button) return;

    const idUser = Number(button.getAttribute("data-user-id"));
    const idActivity = Number(button.getAttribute("data-activity-id"));

    if (!confirm("¿Estás seguro de quitar a este socio de la actividad?")) return;

    button.disabled = true;
    button.textContent = "Quitando...";

    try {
        const response = await RPCWebAPIFetchPrivate("/removeMemberFromActivity", { idUser: idUser, idActivity: idActivity });
        showMessage("resultMessage", response.data.message || "Socio quitado de la actividad correctamente.", false);
        
        const activityName = document.getElementById("modalTitle").textContent.replace("Inscriptos en: ", "");
        await openRegistrationsModal(idActivity, activityName);

    } catch (error) {
        showMessage("resultMessage", "Error al quitar al socio: " + error.message, true);
        button.disabled = false;
        button.textContent = "Quitar de actividad";
    }
}