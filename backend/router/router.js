const { login, logout, changePassword } = require("../services/auth.js");
const { createMembershipApplication, listMembershipApplications, approveMembershipApplication, rejectMembershipApplication, deactivateMyMembership } = require("../services/membership.js");
const { listMembers, getMember, updateMember, deactivateMember, activateMember, getMemberProfile, updateMemberProfile } = require("../services/user.js"); 
const { listAllActivities, listActiveActivities, createActivity, updateActivity, deactivateActivity, activateActivity } = require("../services/activity.js");
const { registerMemberToActivity, cancelRegistration, listMemberRegistrations, listRegistrationsByActivity, removeMemberFromActivity } = require("../services/activityRegistration.js");

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
    routerMap.set('/deactivateMyMembership', { method: deactivateMyMembership, status: "private", roles: ["MEMBER"], allowedStatuses: ["ACTIVE"] });

    // ----- MEMBER ROUTES -----
    routerMap.set('/listMembers', { method: listMembers, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/getMember', { method: getMember, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/updateMember', { method: updateMember, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/deactivateMember', { method: deactivateMember, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/activateMember', { method: activateMember, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/getMemberProfile', { method: getMemberProfile, status: "private", roles: ["MEMBER"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/updateMemberProfile', { method: updateMemberProfile, status: "private", roles: ["MEMBER"], allowedStatuses: ["ACTIVE"] });
    
    // ----- ACTIVITIES ROUTES -----
    routerMap.set('/listActiveActivities', { method: listActiveActivities, status: "public" });
    routerMap.set('/listAllActivities', { method: listAllActivities, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/createActivity', { method: createActivity, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/updateActivity', { method: updateActivity, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/deactivateActivity', { method: deactivateActivity, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/activateActivity', { method: activateActivity, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
        
    // ----- ACTIVITIES REGISTRATION ROUTES -----
    routerMap.set('/registerMemberToActivity', { method: registerMemberToActivity, status: "private", roles: ["MEMBER"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/cancelRegistration', { method: cancelRegistration, status: "private", roles: ["MEMBER"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/removeMemberFromActivity', { method: removeMemberFromActivity, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/listMemberRegistrations', { method: listMemberRegistrations, status: "private", roles: ["MEMBER"], allowedStatuses: ["ACTIVE"] });
    routerMap.set('/listRegistrationsByActivity', { method: listRegistrationsByActivity, status: "private", roles: ["CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });
    
    return routerMap;
}

const InstanceRouter = router();

module.exports = { InstanceRouter: InstanceRouter };