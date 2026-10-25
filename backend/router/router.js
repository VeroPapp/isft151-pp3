const { login, logout, changePassword } = require("../services/auth.js");
const { createMembershipApplication, listMembershipApplications, approveMembershipApplication, rejectMembershipApplication } = require("../services/membership.js");
const { getUserProfile, listMembers } = require("../services/user.js"); 
const { listActivities, createActivity, updateActivity, registerMemberToActivity, cancelRegistration, getMyEnrollments } = require("../services/activity.js");

function router() {
    const routerMap = new Map();

    // ----- AUTHENTICATION ROUTES -----
    routerMap.set('/', {
        method: function (request, response) {

            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: "API Backend Online" }));

        }, status: "public"
    });

    routerMap.set('/login', { method: login, status: "public" });
    routerMap.set('/logout', { method: logout, status: "private", roles: ["MEMBER", "CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE", "PENDINGFORPASSWORDCHANGE"] });
    routerMap.set('/changePassword', { method: changePassword, status: "private", roles: ["MEMBER", "CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE", "PENDINGFORPASSWORDCHANGE"] });

    // ----- MEMBERSHIP APPLICATION ROUTES -----
    routerMap.set('/createMembershipApplication', { method: createMembershipApplication, status: "public" });
    routerMap.set('/listMembershipApplications', { method: listMembershipApplications, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/approveMembershipApplication', { method: approveMembershipApplication, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/rejectMembershipApplication', { method: rejectMembershipApplication, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });

    // ----- MEMBER ROUTES -----
    routerMap.set('/getUserProfile', { method: getUserProfile, status: "private", roles: ["MEMBER", "CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/listMembers', { method: listMembers, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });

    // ----- ACTIVITIES ROUTES -----
    // routerMap.set('/listActivities', { method: listActivities, status: "public" });
    routerMap.set('/listActivities', { 
        method: listActivities, 
        status: "private", 
        roles: ["MEMBER", "CLUB_ADMIN", "SUPER_ADMIN"], 
        allowedStatuses: ["ACTIVE"] 
    });
    
    routerMap.set('/createActivity', { 
        method: createActivity, 
        status: "private", 
        roles: ["CLUB_ADMIN", "SUPER_ADMIN"], 
        allowedStatuses: ["ACTIVE"] 
    });
    
    routerMap.set('/updateActivity', { 
        method: updateActivity, 
        status: "private", 
        roles: ["CLUB_ADMIN", "SUPER_ADMIN"], 
        allowedStatuses: ["ACTIVE"] 
    });

    routerMap.set('/registerMemberToActivity', { 
        method: registerMemberToActivity, 
        status: "private", 
        roles: ["MEMBER"], 
        allowedStatuses: ["ACTIVE"] 
    });
    
    routerMap.set('/cancelRegistration', { 
        method: cancelRegistration, 
        status: "private", 
        roles: ["MEMBER"], 
        allowedStatuses: ["ACTIVE"] 
    });

    routerMap.set('/getMyEnrollments', { 
        method: getMyEnrollments, 
        status: "private", 
        roles: ["MEMBER"], 
        allowedStatuses: ["ACTIVE"] 
});
   //nuevo 24-10-26-----

    return routerMap;
}

const InstanceRouter = router();

module.exports = { InstanceRouter: InstanceRouter };