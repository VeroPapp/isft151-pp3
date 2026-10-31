import { RPCWebAPIFetchPrivate } from '../shared/api.js';
import { formatDate } from '../shared/helpers.js';
import { clearContainer } from '../shared/domUtils.js';

// Función auxiliar local para crear campos del perfil
function createProfileField(labelText, valueText) {
    const field = document.createElement("div");
    field.className = "profile-field";
    
    const label = document.createElement("label");
    label.textContent = labelText;
    
    const span = document.createElement("span");
    span.textContent = valueText;
    
    field.appendChild(label);
    field.appendChild(span);
    return field;
}

export async function loadProfile() {
    const container = document.getElementById("profileContainer");
    clearContainer(container);

    try {
        const response = await RPCWebAPIFetchPrivate("/getMemberProfile", {});
        const profile = response.data.profile;

        document.getElementById("greeting").innerText = "Hola, " + profile.name;

        const grid = document.createElement("div");
        grid.className = "profile-grid";

        grid.appendChild(createProfileField("Nombre", profile.name));
        grid.appendChild(createProfileField("Apellido", profile.surname));
        grid.appendChild(createProfileField("DNI", profile.dni));
        grid.appendChild(createProfileField("Fecha Nac.", formatDate(profile.birthdate)));
        grid.appendChild(createProfileField("Email", profile.email));

        // --- Campo Teléfono con botón de Editar ---
        const phoneField = document.createElement("div");
        phoneField.className = "profile-field";
        phoneField.id = "phoneField";

        const phoneLabel = document.createElement("label");
        phoneLabel.textContent = "Teléfono";

        const phoneWrap = document.createElement("div");
        phoneWrap.style.display = "flex";
        phoneWrap.style.alignItems = "center";
        phoneWrap.style.gap = "10px";

        const phoneSpan = document.createElement("span");
        phoneSpan.id = "phoneDisplay";
        phoneSpan.textContent = profile.phone;

        const editBtn = document.createElement("button");
        editBtn.id = "editPhoneBtn";
        editBtn.className = "btn btn-warning phone-edit-btn";
        editBtn.textContent = "Editar";

        phoneWrap.appendChild(phoneSpan);
        phoneWrap.appendChild(editBtn);
        phoneField.appendChild(phoneLabel);
        phoneField.appendChild(phoneWrap);
        grid.appendChild(phoneField);

        container.appendChild(grid);

    } catch (error) {
        if (error.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userRole");
            window.location.href = "login.html";
            return;
        }
        const errP = document.createElement("p");
        errP.className = "empty-msg";
        errP.textContent = "Error al cargar el perfil: " + error.message;
        container.appendChild(errP);
    }
}

export function onEditPhoneClick() {
    const phoneField = document.getElementById("phoneField");
    const currentPhone = document.getElementById("phoneDisplay").innerText;

    clearContainer(phoneField);

    const label = document.createElement("label");
    label.textContent = "Teléfono";
    phoneField.appendChild(label);

    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "10px";

    const input = document.createElement("input");
    input.type = "tel";
    input.id = "phoneInput";
    input.value = currentPhone;
    input.className = "phone-edit-input";

    const saveBtn = document.createElement("button");
    saveBtn.id = "savePhoneBtn";
    saveBtn.className = "btn btn-success phone-edit-btn";
    saveBtn.textContent = "Guardar";

    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancelPhoneBtn";
    cancelBtn.className = "btn btn-danger phone-edit-btn";
    cancelBtn.textContent = "Cancelar";

    wrap.appendChild(input);
    wrap.appendChild(saveBtn);
    wrap.appendChild(cancelBtn);
    phoneField.appendChild(wrap);

    saveBtn.onclick = onSavePhoneClick;
    cancelBtn.onclick = onCancelPhoneClick;
    input.focus();
}

async function onSavePhoneClick() {
    const newPhone = document.getElementById("phoneInput").value.trim();
    
    if (!newPhone) {
        alert("El teléfono no puede estar vacío.");
        return;
    }

    const saveBtn = document.getElementById("savePhoneBtn");
    saveBtn.disabled = true;
    saveBtn.innerText = "Guardando...";

    try {
        await RPCWebAPIFetchPrivate("/updateMemberProfile", { phone: newPhone });
        await loadProfile();
        alert("¡Teléfono actualizado correctamente!");
    } catch (error) {
        alert("Error al actualizar el teléfono: " + error.message);
        saveBtn.disabled = false;
        saveBtn.innerText = "Guardar";
    }
}

function onCancelPhoneClick() {
    loadProfile();
}