import { RPCWebAPIFetchPrivate } from '../shared/api.js';

const resultDiv = document.getElementById("resultMessage");
const submitButton = document.getElementById("submitButton");

let isSubmitting = false;

export function setupView() {
    const backLink = document.getElementById("backLink");
    const pageTitle = document.getElementById("pageTitle");
    const pageSubtitle = document.getElementById("pageSubtitle");
    const noticeDiv = document.getElementById("passwordNotice");

    const urlParams = new URLSearchParams(window.location.search);
    const isMandatory = urlParams.get("mandatory") === "true";

    if (isMandatory) {
        pageTitle.textContent = "Cambio de contraseña obligatorio";

        noticeDiv.className = "password-notice mandatory";
        noticeDiv.textContent = "🔒 Primera sesión. Tu cuenta fue creada con una contraseña temporal. Debés cambiarla antes de continuar.";

        backLink.style.display = "none";
        return;
    }

    pageTitle.textContent = "Cambiar contraseña";
    pageSubtitle.textContent = "Ingresá tu contraseña actual y elegí una nueva.";

    noticeDiv.className = "password-notice voluntary";
    noticeDiv.textContent = "ℹ️ Una vez que cambies tu contraseña, se cerrará tu sesión actual.";

    const role = localStorage.getItem("userRole");
    if (role === "CLUB_ADMIN" || role === "SUPER_ADMIN") {
        backLink.href = "adminProfile.html";
    } else {
        backLink.href = "memberProfile.html";
    }
}

function showError(message, fieldId) {
    resultDiv.style.display = "block";
    resultDiv.className = "error shake";
    resultDiv.textContent = message;

    document.querySelectorAll(".password-input-wrap input").forEach((input) => {
        input.classList.remove("invalid");
    });

    if (fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add("invalid");
            field.focus();
        }
    }

    setTimeout(() => {
        resultDiv.classList.remove("shake");
    }, 500);
}

export function clearError() {
    resultDiv.className = "";
    resultDiv.textContent = "";
    resultDiv.style.display = "";

    document.querySelectorAll(".password-input-wrap input").forEach((input) => {
        input.classList.remove("invalid");
    });
}

function validatePasswordStrength(password) {
    if (password.length < 8) {
        return "La nueva contraseña debe tener al menos 8 caracteres.";
    }

    if (!/[A-Z]/.test(password)) {
        return "La nueva contraseña debe incluir al menos una letra mayúscula.";
    }

    if (!/[a-z]/.test(password)) {
        return "La nueva contraseña debe incluir al menos una letra minúscula.";
    }

    if (!/[0-9]/.test(password)) {
        return "La nueva contraseña debe incluir al menos un número.";
    }

    if (!/[!@#$%^&*(),.?\":{}|<>_+\-=]/.test(password)) {
        return "La nueva contraseña debe incluir al menos un carácter especial.";
    }

    return null;
}

function showSuccessView() {
    const urlParams = new URLSearchParams(window.location.search);
    const isMandatory = urlParams.get("mandatory") === "true";

    const message = isMandatory
        ? "¡Contraseña actualizada! Tu contraseña temporal fue reemplazada correctamente. Ahora podés ingresar con tu nueva contraseña."
        : "¡Contraseña cambiada! Tu contraseña fue actualizada con éxito. Por seguridad, cerraremos tu sesión actual.";

    alert(message);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");

    window.location.replace("login.html");
}

export async function onChangePasswordSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    clearError();

    const currentPasswordInput = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!currentPassword) {
        showError("Ingresá tu contraseña actual.", "currentPassword");
        return;
    }

    if (!newPassword) {
        showError("Ingresá la nueva contraseña.", "newPassword");
        return;
    }

    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
        showError(strengthError, "newPassword");
        return;
    }

    if (!confirmPassword) {
        showError("Confirmá la nueva contraseña.", "confirmPassword");
        return;
    }

    if (newPassword !== confirmPassword) {
        showError("La nueva contraseña y la confirmación no coinciden.", "confirmPassword");
        return;
    }

    if (newPassword === currentPassword) {
        showError("La nueva contraseña no puede ser igual a la actual.", "newPassword");
        return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.textContent = "Cambiando...";

    try {
        await RPCWebAPIFetchPrivate("/changePassword", {
            currentPassword,
            newPassword,
            confirmPassword
        });

        showSuccessView();
    } catch (error) {
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.textContent = "Cambiar contraseña";

        if (error.detail === "NetworkError") {
            showError("No se pudo conectar con el servidor. Verificá que el backend esté corriendo.", null);
            return;
        }

        const message = error.message || "No se pudo cambiar la contraseña.";
        const lower = message.toLowerCase();

        let fieldId = null;

        if (lower.includes("actual")) {
            fieldId = "currentPassword";
        } else if (lower.includes("coinciden") || lower.includes("confirmaci")) {
            fieldId = "confirmPassword";
        } else if (lower.includes("nueva") || lower.includes("caracteres") || lower.includes("dni") || lower.includes("email")) {
            fieldId = "newPassword";
        }

        showError(message, fieldId);
    }
}