const { createMembershipApplication } = require("../services/membership.js")
const { login, logout } = require("../services/auth.js")

function router() {

    const router = new Map();

    // ----- AUTHENTICATION ROUTES -----
    router.set('/', function (request, response) {});
    router.set('/api/auth/login', login);
    router.set('/api/auth/logout', logout);



    // ----- MEMBERSHIP APPLICATION ROUTES -----
    router.set('/api/membership/createMembershipApplication', createMembershipApplication);
    // router.set('/api/membership/listMembershipApplications', listMembershipApplications);
    // router.set('/api/membership/approveMembershipApplication', approveMembershipApplication);
    // router.set('/api/membership/rejectMembershipApplication', rejectMembershipApplication);


    return router

}

const InstanceRouter = router()

module.exports = { InstanceRouter: InstanceRouter }