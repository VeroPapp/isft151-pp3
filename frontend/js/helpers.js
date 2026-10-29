// 1. Formatear fecha de YYYY-MM-DD a DD/MM/YYYY (para tablas)
export function formatDate(dateString) {
    if (!dateString) return "—";
    const datePart = dateString.split(" ")[0]; // Por si viene con hora
    const parts = datePart.split("-");
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// 2. Formatear fecha para HTML (devuelve ? si está vacía)
export function formatDateForHTML(dateString) {
    if (!dateString) return "?";
    return dateString.split("-").reverse().join("/");
}

// 3. Mostrar cartel de éxito o error
export function showMessage(containerId, message, isError = false) {
    const resultDiv = document.getElementById(containerId);
    if (!resultDiv) return;

    resultDiv.style.display = "block";
    
    // Clases base
    let classes = isError ? "error" : "ok";
    
    // Clases específicas para el login (que tiene su propio diseño)
    if (containerId === "resultMessage" && document.body.classList.contains("login-page")) {
        classes = isError ? "login-result login-result-error shake" : "login-result login-result-ok";
        if (isError) {
            setTimeout(function() {
                resultDiv.classList.remove("shake");
            }, 500);
        }
    } else if (containerId === "resultMessage" && document.body.classList.contains("landing")) {
        classes = isError ? "landing-result landing-result-error" : "landing-result landing-result-ok";
    }

    resultDiv.className = classes;
    resultDiv.innerText = message;

    if (isError) console.error("[ERROR]", message);
    else console.log("[OK]", message);
}

// 4. Configurar el botón "ojito" para mostrar/ocultar contraseña
export function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll(".toggle-password");
    
    toggleButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            const input = document.getElementById(button.getAttribute("data-target"));
            if (!input) return;
            
            const isShowing = input.type === "text";
            input.type = isShowing ? "password" : "text";
            button.textContent = isShowing ? "👁" : "🙈";
            button.setAttribute("aria-label", isShowing ? "Mostrar contraseña" : "Ocultar contraseña");
        });
    });
}

// 5. Generar HTML de los badges de estado
export function getStatusBadge(status) {
    const labels = {
        "ACTIVE": { text: "Activo", cls: "badge-active" },
        "PENDINGFORPASSWORDCHANGE": { text: "Cambio de contraseña pendiente", cls: "badge-pending" },
        "PENDINGFORAPPROBATION": { text: "Pendiente", cls: "badge-pending" },
        "INACTIVE": { text: "Inactivo", cls: "badge-inactive" },
        "REJECTED": { text: "Rechazado", cls: "badge-rejected" }
    };
    const label = labels[status] || { text: status || "—", cls: "badge-inactive" };
    return `<span class="badge ${label.cls}">${label.text}</span>`;
}

// 6. Manejar el Logout (compartido entre admin y socio)
export async function handleLogout(RPCWebAPIFetchPrivate) {
    try {
        await RPCWebAPIFetchPrivate("/logout", {});
    } catch (error) {
        console.warn("Logout warning:", error.message);
    } finally {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        window.location.href = "login.html";
    }
}