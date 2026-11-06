import { RPCWebAPIFetchPrivate } from '../shared/api.js';
import { handleLogout } from '../shared/helpers.js';
import { loadProfile, onEditPhoneClick } from './profile.js';
import { loadActivities, onRegisterClick } from './activities.js';
import { loadRegistrations, onCancelRegisterClick } from './registrations.js';
import { onDeactivateMembershipClick } from './membership.js';

if (!localStorage.getItem("accessToken")) {
    window.location.href = "login.html";
}

function main() {
    
    document.getElementById("logoutButton").onclick = function () {
        handleLogout(RPCWebAPIFetchPrivate);
    };

    document.getElementById("deactivateMembershipButton").onclick = onDeactivateMembershipClick;
    document.getElementById("activitiesContainer").onclick = onRegisterClick;
    document.getElementById("registrationsContainer").onclick = onCancelRegisterClick;

    document.getElementById("profileContainer").onclick = function (event) {
        if (event.target.closest("#editPhoneBtn")) {
            onEditPhoneClick();
        }
    };

    
    loadProfile();
    loadActivities();
    loadRegistrations();
}

window.onload = main;