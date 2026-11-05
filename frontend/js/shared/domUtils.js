import { formatDateForHTML } from "./helpers.js";


export function clearContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}


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


export function createActivityCard(activity, options) {
    
    if (!options) {
        options = {};
    }

    
    var card = document.createElement("article");
    card.className = "activity-card";

    
    if (options.showRegisterButton || options.isRegistered) {
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.justifyContent = "space-between";
    }

    
    if (options.isRegistered) {
        card.style.borderLeft = "4px solid var(--success-text)";
    }

    
    var contentDiv = document.createElement("div");

    
    var headerDiv = document.createElement("div");
    headerDiv.className = "activity-header";

    var title = document.createElement("h3");
    title.textContent = activity.name;
    headerDiv.appendChild(title);

    
    if (activity.scope && !options.isRegistered) {
        var scope = document.createElement("span");
        scope.className = "activity-scope-badge";
        scope.textContent = activity.scope;
        headerDiv.appendChild(scope);
    }
    contentDiv.appendChild(headerDiv);

    
    if (activity.startDate || activity.endDate) {
        var dates = document.createElement("p");
        dates.className = "activity-dates";
        dates.textContent = "📅 Del " + formatDateForHTML(activity.startDate) + " al " + formatDateForHTML(activity.endDate);
        contentDiv.appendChild(dates);
    }

    
    contentDiv.appendChild(createSchedulesNode(activity.schedules));

    
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

    
    if (activity.instructor) {
        var inst = document.createElement("p");
        inst.className = "activity-instructor";
        inst.textContent = "Prof. " + activity.instructor;
        contentDiv.appendChild(inst);
    }

    
    if (activity.description) {
        var desc = document.createElement("p");
        desc.className = "activity-desc";
        desc.textContent = activity.description;
        contentDiv.appendChild(desc);
    }

    
    card.appendChild(contentDiv);

    
    
    if (options.showRegisterButton) {
        
        var registerBtn = document.createElement("button");
        registerBtn.className = "btn btn-success register-btn";
        registerBtn.setAttribute("data-id", activity.idActivity);
        registerBtn.style.marginTop = "15px";
        registerBtn.style.width = "100%";
        registerBtn.textContent = "Inscribirme";
        card.appendChild(registerBtn);

    } else if (options.isRegistered) {
        
        var bottomWrap = document.createElement("div");
        bottomWrap.style.marginTop = "15px";

        
        var status = document.createElement("p");
        status.style.color = "var(--success-text)";
        status.style.fontWeight = "bold";
        status.style.fontSize = "0.85rem";
        status.style.marginBottom = "8px";
        status.textContent = "✅ Inscripto";
        bottomWrap.appendChild(status);

        
        var cancelBtn = document.createElement("button");
        cancelBtn.className = "btn btn-danger cancel-register-btn";
        cancelBtn.setAttribute("data-id", activity.idActivity);
        cancelBtn.style.width = "100%";
        cancelBtn.textContent = "Cancelar Inscripción";
        bottomWrap.appendChild(cancelBtn);

        card.appendChild(bottomWrap);
    }

    return card;
}


export function createCell(text, isStrong) {
    const td = document.createElement("td");
    if (isStrong) {
        const strong = document.createElement("strong");
        strong.textContent = text;
        td.appendChild(strong);
    } else {
        td.textContent = text;
    }
    return td;
}


export function createButton(text, className, dataAttributes) {
    const btn = document.createElement("button");
    btn.className = className;
    btn.textContent = text;
    if (dataAttributes) {
        for (const key in dataAttributes) {
            btn.setAttribute(key, dataAttributes[key]);
        }
    }
    return btn;
}