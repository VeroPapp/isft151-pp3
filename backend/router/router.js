const { login, logout } = require("../services/auth.js");
const { createMembershipApplication } = require("../services/membership.js");

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
    routerMap.set('/logout', { method: logout, status: "private", roles: ["MEMBER", "CLUB_ADMIN", "SUPER_ADMIN"] });

    // ----- MEMBERSHIP APPLICATION ROUTES -----
    routerMap.set('/createMembershipApplication', { method: createMembershipApplication, status: "public" });
    // routerMap.set('/listMembershipApplications', listMembershipApplications);
    // routerMap.set('/approveMembershipApplication', approveMembershipApplication);
    // routerMap.set('/rejectMembershipApplication', rejectMembershipApplication);

    return routerMap;
}

const InstanceRouter = router();

module.exports = { InstanceRouter: InstanceRouter };