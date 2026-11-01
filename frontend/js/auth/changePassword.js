import { RPCWebAPIFetchPrivate } from '../shared/api.js';

const resultDiv = document.getElementById("resultMessage");
const submitButton = document.getElementById("submitButton");
const formView = document.getElementById("formView");
const successView = document.getElementById("successView");

let isSubmitting = false;

export function setupView() {
    const backLink = document.getElementById("backLink");
    const pageTitle = document.getElementById("pageTitle");
    const pageSubtitle = document.getElementById("pageSubtitle");
    const noticeDiv = document.getElementById("passwordNotice");
    
    const urlParams = new URLSearchParams(window.location.search);
    const isMandatory = urlParams.get('mandatory') === 'true';

    if (isMandatory) {
        // Configuración para PRIMER INICIO (Obligatorio)
        pageTitle.textContent = "Cambio de contraseña obligatorio";
        
        noticeDiv.className = "password-notice mandatory";
        noticeDiv.innerHTML = "<strong>🔒 Primera sesión</strong>" +
            "Tu cuenta fue creada con una contraseña temporal. " +
            "Por seguridad, debés cambiarla antes de acceder al sistema. " +
            "Al guardar los cambios, vas a ser redirigido al inicio de sesión para ingresar con tu nueva contraseña.";
        
        backLink.style.display = "none";
    } else {
        // Configuración para CAMBIO VOLUNTARIO
        pageTitle.textContent = "Cambiar contraseña";
        pageSubtitle.textContent = "Ingresá tu contraseña actual y elegí una nueva.";
        
        noticeDiv.className = "password-notice voluntary";
        noticeDiv.innerHTML = "<strong>ℹ️ Cierre de sesión al finalizar</strong>" +
            "Una vez que cambies tu contraseña, se cerrará tu sesión actual. " +
            "Vas a ser redirigido al inicio de sesión para ingresar con tu nueva contraseña.";
        
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

function showSuccessView() {
    const urlParams = new URLSearchParams(window.location.search);
    const isMandatory = urlParams.get('mandatory') === 'true';
    const successTitle = document.getElementById("successTitle");
    const successMessage = document.getElementById("successMessage");

    if (isMandatory) {
        successTitle.textContent = "¡Contraseña actualizada!";
        successMessage.textContent = "Tu contraseña temporal fue reemplazada correctamente. Ahora podés ingresar al sistema con tu nueva contraseña.";
    } else {
        successTitle.textContent = "¡Contraseña cambiada!";
        successMessage.textContent = "Tu contraseña fue actualizada con éxito. Por seguridad, cerraremos tu sesión actual.";
    }

    // Ocultar form, mostrar éxito
    formView.classList.add("hidden");
    successView.classList.remove("hidden");

    // Limpiar tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");

    // Redirigir después de 2.5 segundos
    setTimeout(function () {
        window.location.replace("login.html");
    }, 2500);
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

        // Mostrar vista de éxito en lugar de redirigir de inmediato
        showSuccessView();

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