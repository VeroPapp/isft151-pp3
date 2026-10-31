import { RPCWebAPIFetchPublic } from '../shared/api.js';
import { showMessage } from '../shared/helpers.js';

export async function onRegisterSubmit(event) {
    event.preventDefault();
    
    // Usamos event.target para obtener el form directamente y poder hacer reset
    const form = event.target;

    const dniValue = document.getElementById("dni").value.trim();
    const birthdateValue = document.getElementById("birthdate").value;

    // Validación de DNI
    if (!/^\d{8}$/.test(dniValue)) {
        showMessage("resultMessage", "El DNI debe tener exactamente 8 dígitos numéricos.", true);
        return;
    }

    // Validación de Fecha de Nacimiento (Año)
    const year = birthdateValue.split("-")[0];
    if (year.length !== 4) {
        showMessage("resultMessage", "El año de nacimiento debe tener 4 dígitos.", true);
        return;
    }

    // Validación de Fecha de Nacimiento (Futuro)
    const birthDateObj = new Date(birthdateValue + "T00:00:00");
    const today = new Date();
    if (birthDateObj > today) {
        showMessage("resultMessage", "La fecha de nacimiento no puede ser una fecha futura.", true);
        return;
    }

    // Armado de Payload
    const payload = {
        name: document.getElementById("name").value.trim(),
        surname: document.getElementById("surname").value.trim(),
        dni: dniValue,
        birthdate: birthdateValue,
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim()
    };

    // Envío al backend
    try {
        const response = await RPCWebAPIFetchPublic("/createMembershipApplication", payload);
        const successMessage = response.data.message || "¡Tu solicitud fue enviada con éxito! Pronto nos comunicaremos con vos vía mail.";
        
        showMessage("resultMessage", successMessage, false);
        form.reset();
    } catch (error) {
        showMessage("resultMessage", error.message || "Hubo un error al enviar la solicitud.", true);
    }
}