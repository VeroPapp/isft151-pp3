import { RPCWebAPIFetchPrivate } from '../shared/api';

export async function onDeactivateMembershipClick() {
    const confirmed = confirm("¿Estás seguro de que querés darte de baja del club?");
    if (!confirmed) return;

    const button = document.getElementById("deactivateMembershipButton");
    button.disabled = true;
    button.textContent = "Procesando...";

    try {
        const response = await RPCWebAPIFetchPrivate("/deactivateMyMembership", {});
        alert(response.data.message || "Tu membresía fue dada de baja correctamente.");
        
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        window.location.href = "login.html";

    } catch (error) {
        alert("No se pudo dar de baja la membresía: " + error.message);
        button.disabled = false;
        button.textContent = "Darme de baja del club";
    }
}