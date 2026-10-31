import { RPCWebAPIFetchPublic } from '../shared/api.js';
import { showMessage } from '../shared/helpers.js';

export async function onLoginSubmit(event) {
    event.preventDefault();
    
    const button = document.getElementById("loginButton");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validación rápida de campos vacíos
    if (!email || !password) {
        showMessage("resultMessage", "Los datos ingresados son incorrectos.", true);
        emailInput.value = "";
        passwordInput.value = "";
        emailInput.focus();
        return;
    }
    
    button.disabled = true;
    button.innerText = "Ingresando...";

    try {
        const response = await RPCWebAPIFetchPublic("/login", { email: email, password: password });
        const user = response.data.user;
        
        // Guardamos el rol para las redirecciones y la UX del frontend
        localStorage.setItem("userRole", user.role || "");

        // Si es primer inicio, va a cambiar la contraseña
        if (response.data.redirectToChangePassword) {
            window.location.href = "changePassword.html?mandatory=true";
            return;
        }

        // Redirección según el rol
        if (user.role === "CLUB_ADMIN" || user.role === "SUPER_ADMIN") {
            window.location.href = "adminProfile.html";
        } else {
            window.location.href = "memberProfile.html";
        }

    } catch (error) {
        showMessage("resultMessage", error.message || "Los datos ingresados son incorrectos.", true);
        emailInput.value = "";
        passwordInput.value = "";
        button.disabled = false;
        button.innerText = "Ingresar";
        emailInput.focus(); 
    }
}