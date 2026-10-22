const { login, logout, changePassword } = require("../services/auth.js");
const { createMembershipApplication, listMembershipApplications, approveMembershipApplication, rejectMembershipApplication } = require("../services/membership.js");

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
    routerMap.set('/getMemberByID', { method: getMemberByID, status: "private", roles: ["MEMBER", "CLUB_ADMIN", "SUPER_ADMIN"], allowedStatuses: ["ACTIVE"] });


    // ----- ACTIVITIES ROUTES -----



    return routerMap;
}

const InstanceRouter = router();

module.exports = { InstanceRouter: InstanceRouter };