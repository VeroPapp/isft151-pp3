import { RPCWebAPIFetchPublic } from '../shared/api.js';
import { showMessage } from '../shared/helpers.js';

export async function onRegisterSubmit(event) {
    event.preventDefault();
    
    
    const form = event.target;

    const dniValue = document.getElementById("dni").value.trim();
    const birthdateValue = document.getElementById("birthdate").value;
    const phoneValue = document.getElementById("phone").value.trim();

    
    if (!/^\d{8}$/.test(dniValue)) {
        showMessage("resultMessage", "El DNI debe tener exactamente 8 dígitos numéricos.", true);
        return;
    }

    
    const year = birthdateValue.split("-")[0];
    if (year.length !== 4) {
        showMessage("resultMessage", "El año de nacimiento debe tener 4 dígitos.", true);
        return;
    }

    
    const birthDateObj = new Date(birthdateValue + "T00:00:00");
    const today = new Date();
    if (birthDateObj > today) {
        showMessage("resultMessage", "La fecha de nacimiento no puede ser una fecha futura.", true);
        return;
    }

    
    if (!/^\d{8,13}$/.test(phoneValue)) {
        showMessage(
            "resultMessage",
            "El teléfono debe tener entre 8 y 13 dígitos numéricos (sin espacios ni guiones).",
            true
        );
        return;
    }

    
    const payload = {
        name: document.getElementById("name").value.trim(),
        surname: document.getElementById("surname").value.trim(),
        dni: dniValue,
        birthdate: birthdateValue,
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim()
    };

    
    try {
        const response = await RPCWebAPIFetchPublic("/createMembershipApplication", payload);
        const successMessage = response.data.message || "¡Tu solicitud fue enviada con éxito! Pronto nos comunicaremos con vos vía mail.";

        alert(successMessage);
        form.reset();

    } catch (error) {
        showMessage("resultMessage", error.message || "Hubo un error al enviar la solicitud.", true);
    }
}