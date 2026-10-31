import { RPCWebAPIFetchPrivate } from '../shared/api';

const resultDiv = document.getElementById("resultMessage");
const submitButton = document.getElementById("submitButton");
let isSubmitting = false;

export function setupBackLink() {
    const backLink = document.getElementById("backLink");
    const urlParams = new URLSearchParams(window.location.search);
    const isMandatory = urlParams.get('mandatory') === 'true';

    // Ocultar el botón de "Volver" si el cambio es obligatorio
    if (isMandatory) {
        backLink.style.display = "none";
    } else {
        // Configurar el enlace de "Volver" según el rol
        const role = localStorage.getItem("userRole");
        if (role === "CLUB_ADMIN" || role === "SUPER_ADMIN") {
            backLink.href = "adminProfile.html";
        } else {
            backLink.href = "memberProfile.html";
        }
    }
}

function showError(message, fieldId) {
    resultDiv.style.display = "block";
    resultDiv.className = "error shake";
    resultDiv.innerHTML = `<span>⚠️</span> ${message}`;
    console.error("[change-password]", message);

    document.querySelectorAll(".password-input-wrap input").forEach(function(input) {
        input.classList.remove("invalid");
    });

    if (fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add("invalid");
            field.focus();
        }
    }

    setTimeout(function() {
        resultDiv.classList.remove("shake");
    }, 500);
}

export function clearError() {
    resultDiv.className = "";
    resultDiv.innerText = "";
    resultDiv.style.display = "";

    document.querySelectorAll(".password-input-wrap input").forEach(function(input) {
        input.classList.remove("invalid");
    });
}

function validatePasswordStrength(password) {
    if (password.length < 8) return "La nueva contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(password)) return "La nueva contraseña debe incluir al menos una letra mayúscula.";
    if (!/[a-z]/.test(password)) return "La nueva contraseña debe incluir al menos una letra minúscula.";
    if (!/[0-9]/.test(password)) return "La nueva contraseña debe incluir al menos un número.";
    if (!/[!@#$%^&*(),.?":{}|<>_+\-=]/.test(password)) return "La nueva contraseña debe incluir al menos un carácter especial.";
    return null;
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

    // Validaciones locales
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

    // Envío al Backend
    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.textContent = "Cambiando...";

    try {
        await RPCWebAPIFetchPrivate("/changePassword", {
            currentPassword: currentPassword,
            newPassword: newPassword,
            confirmPassword: confirmPassword
        });

        // Si sale bien, deslogueamos y mandamos al login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        window.location.replace("login.html");

    } catch (error) {
        let errorMessage;
        if (error.detail === "NetworkError") {
            errorMessage = "No se pudo conectar con el servidor. Verificá que el backend esté corriendo.";
        } else {
            errorMessage = error.message || "No se pudo cambiar la contraseña.";
        }

        showError(errorMessage);
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.textContent = "Cambiar contraseña";
    }
}