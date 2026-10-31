import { loadActivities } from './activities.js';
import { onRegisterSubmit } from './membership.js';

function main() {
    // Asignamos los eventos
    document.getElementById("membershipForm").onsubmit = onRegisterSubmit;
    
    // Cargamos los datos iniciales
    loadActivities();
}

window.onload = main;