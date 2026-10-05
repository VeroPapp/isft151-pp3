const { login, logout } = require("../services/auth.js");
const { createMembershipApplication } = require("../services/membership.js");

function router() {
    const routerMap = new Map();

    // ----- AUTHENTICATION ROUTES -----
    routerMap.set('/', function (request, response) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "API Backend Online" }));
    });
    
    routerMap.set('/api/auth/login', login);
    routerMap.set('/api/auth/logout', logout);

    // ----- MEMBERSHIP APPLICATION ROUTES -----
    routerMap.set('/api/membership/createMembershipApplication', createMembershipApplication);
    // routerMap.set('/api/membership/listMembershipApplications', listMembershipApplications);
    // routerMap.set('/api/membership/approveMembershipApplication', approveMembershipApplication);
    // routerMap.set('/api/membership/rejectMembershipApplication', rejectMembershipApplication);

    return routerMap;
}

const InstanceRouter = router();

module.exports = { InstanceRouter: InstanceRouter };