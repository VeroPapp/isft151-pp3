import { loadActivities } from './activities.js';
import { onRegisterSubmit } from './membership.js';

function main() {
    
    document.getElementById("membershipForm").onsubmit = onRegisterSubmit;
    
    
    loadActivities();
}

window.onload = main;