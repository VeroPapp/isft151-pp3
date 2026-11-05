
export function formatDate(dateString) {
    if (!dateString) return "—";
    const datePart = dateString.split(" ")[0]; 
    const parts = datePart.split("-");
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


export function formatDateForHTML(dateString) {
    if (!dateString) return "?";
    return dateString.split("-").reverse().join("/");
}


export function showMessage(containerId, message, isError = false) {
    const resultDiv = document.getElementById(containerId);
    if (!resultDiv) return;

    resultDiv.style.display = "block";
    
    
    let classes = isError ? "error" : "ok";
    
    
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