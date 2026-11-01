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
        const response = await RPCWebAPIFetchPublic("/login", { email, password });
        const user = response.data.user;
        
        localStorage.setItem("userRole", user.role || "");

        if (response.data.redirectToChangePassword) {
            window.location.href = "changePassword.html?mandatory=true";
            return;
        }

        if (user.role === "CLUB_ADMIN" || user.role === "SUPER_ADMIN") {
            window.location.href = "adminProfile.html";
        } else {
            window.location.href = "memberProfile.html";
        }


    } catch (error) {
        showMessage("resultMessage", error.message || "Los datos ingresados son incorrectos.", true);
        
        emailInput.value = "";
        passwordInput.value = "";
        emailInput.focus(); 
        
        button.disabled = false;
        button.innerText = "Ingresar";
    }
}