import { formatDateForHTML } from "./helpers.js";

// 1. Vaciar un contenedor
export function clearContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

// 2. Crear la lista de horarios (reutilizable en todas las vistas)
export function createSchedulesNode(schedules) {
    var div = document.createElement("div");
    div.className = "schedules";
    
    if (!schedules) return div;

    for (var i = 0; i < schedules.length; i++) {
        var s = schedules[i];
        var p = document.createElement("p");
        p.className = "activity-day";
        
        var strong = document.createElement("strong");
        strong.textContent = s.day;
        
        p.appendChild(strong);
        p.appendChild(document.createTextNode(" · " + s.startTime + " a " + s.endTime));
        div.appendChild(p);
    }
    return div;
}

// 3. Crear tarjeta de actividad (reutilizable en el index, socio y admin)
export function createActivityCard(activity, options) {
    // Si no nos pasan opciones, usamos un objeto vacío para evitar errores
    if (!options) {
        options = {};
    }

    // 1. Creamos la tarjeta principal
    var card = document.createElement("article");
    card.className = "activity-card";

    // Le damos flexbox si vamos a ponerle botones abajo (socio)
    if (options.showEnrollButton || options.isEnrolled) {
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.justifyContent = "space-between";
    }

    // Si es una inscripción, le ponemos el borde verde
    if (options.isEnrolled) {
        card.style.borderLeft = "4px solid var(--success-text)";
    }

    // 2. Contenedor del contenido (todo menos los botones)
    var contentDiv = document.createElement("div");

    // --- HEADER (Título + Alcance) ---
    var headerDiv = document.createElement("div");
    headerDiv.className = "activity-header";

    var title = document.createElement("h3");
    title.textContent = activity.name;
    headerDiv.appendChild(title);

    // El alcance solo lo mostramos si existe y no es una tarjeta de "inscripto"
    if (activity.scope && !options.isEnrolled) {
        var scope = document.createElement("span");
        scope.className = "activity-scope-badge";
        scope.textContent = activity.scope;
        headerDiv.appendChild(scope);
    }
    contentDiv.appendChild(headerDiv);

    // --- FECHAS ---
    if (activity.startDate || activity.endDate) {
        var dates = document.createElement("p");
        dates.className = "activity-dates";
        dates.textContent = "📅 Del " + formatDateForHTML(activity.startDate) + " al " + formatDateForHTML(activity.endDate);
        contentDiv.appendChild(dates);
    }

    // --- HORARIOS (Usa la función createSchedulesNode) ---
    contentDiv.appendChild(createSchedulesNode(activity.schedules));

    // --- CUPOS (Solo si lo pedimos, ej: en el perfil del socio) ---
    if (options.showCapacity && activity.capacity) {
        var disponibles = (activity.availablePlaces !== undefined && activity.availablePlaces !== null) 
            ? activity.availablePlaces 
            : activity.capacity;
        
        var inscriptos = activity.capacity - disponibles;
        
        var cap = document.createElement("p");
        cap.className = "activity-capacity";
        cap.textContent = "👥 " + inscriptos + " inscripto(s) de " + activity.capacity + " cupos";
        contentDiv.appendChild(cap);
    }

    // --- INSTRUCTOR ---
    if (activity.instructor) {
        var inst = document.createElement("p");
        inst.className = "activity-instructor";
        inst.textContent = "Prof. " + activity.instructor;
        contentDiv.appendChild(inst);
    }

    // --- DESCRIPCIÓN ---
    if (activity.description) {
        var desc = document.createElement("p");
        desc.className = "activity-desc";
        desc.textContent = activity.description;
        contentDiv.appendChild(desc);
    }

    // Agregamos todo el contenido a la tarjeta
    card.appendChild(contentDiv);

    // 3. BOTONES (Inscribirme o Cancelar Inscripción)
    
    if (options.showEnrollButton) {
        // --- BOTÓN INSCRIBIRME (para actividades disponibles) ---
        var enrollBtn = document.createElement("button");
        enrollBtn.className = "btn btn-success enroll-btn";
        enrollBtn.setAttribute("data-id", activity.idActivity);
        enrollBtn.style.marginTop = "15px";
        enrollBtn.style.width = "100%";
        enrollBtn.textContent = "Inscribirme";
        card.appendChild(enrollBtn);

    } else if (options.isEnrolled) {
        // --- CARTEL "INSCRIPTO" + BOTÓN CANCELAR (para mis inscripciones) ---
        var bottomWrap = document.createElement("div");
        bottomWrap.style.marginTop = "15px";

        // Cartel de confirmación
        var status = document.createElement("p");
        status.style.color = "var(--success-text)";
        status.style.fontWeight = "bold";
        status.style.fontSize = "0.85rem";
        status.style.marginBottom = "8px";
        status.textContent = "✅ Inscripto";
        bottomWrap.appendChild(status);

        // Botón de cancelar
        var cancelBtn = document.createElement("button");
        cancelBtn.className = "btn btn-danger cancel-enrollment-btn";
        cancelBtn.setAttribute("data-id", activity.idActivity);
        cancelBtn.style.width = "100%";
        cancelBtn.textContent = "Cancelar Inscripción";
        bottomWrap.appendChild(cancelBtn);

        card.appendChild(bottomWrap);
    }

    return card;
}