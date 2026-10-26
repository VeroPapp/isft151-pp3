const { login, logout, changePassword } = require("../services/auth.js");
const { createMembershipApplication, listMembershipApplications, approveMembershipApplication, rejectMembershipApplication } = require("../services/membership.js");
const { listMembers, getMember, updateMember, removeMember, getMemberProfile, updateMemberProfile } = require("../services/user.js"); 
// const { listActivities } = require("../services/activities.js"); 

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

    // * Faltan del MODULO Member Profile:
    // * /getMemberActivities 
    // * /getMemberActivityByID

    // ******* HECHO MODULO MEMBERS y mitad de MEMBER PROFILE COMPLETADO **************
    routerMap.set('/listMembers', { method: listMembers, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/getMember', { method: getMember, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/updateMember', { method: updateMember, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/removeMember', { method: removeMember, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/getMemberProfile', { method: getMemberProfile, status: "private", roles: ["MEMBER"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/updateMemberProfile', { method: updateMemberProfile, status: "private", roles: ["MEMBER"], allowedStatuses: ["ACTIVE"] });
    
    // ----- ACTIVITIES ROUTES -----
    // routerMap.set('/listActivities', { method: listActivities, status: "public" });



    return routerMap;
}

const InstanceRouter = router();

module.exports = { InstanceRouter: InstanceRouter };