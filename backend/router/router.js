const { defaultHandler } = require("../services/defaultHandler.js")
const { login } = require("../services/auth.js")

function router() {

    const router = new Map();

    // ----- AUTHENTICATION ROUTES -----
    router.set('/', defaultHandler);
    router.set('/api/auth/login', login);
    // router.set('/api/auth/logout', logoutHandler);



    // ----- MEMBERSHIP APPLICATION ROUTES -----
    router.set('/api/membership/createMembershipApplication', createMembershipApplication);
    router.set('/api/membership/listMembershipApplications', listMembershipApplications);
    router.set('/api/membership/approveMembershipApplication', approveMembershipApplication);
    router.set('/api/membership/rejectMembershipApplication', rejectMembershipApplication);


    return router

}

const InstanceRouter = router()

module.exports = { InstanceRouter: InstanceRouter }