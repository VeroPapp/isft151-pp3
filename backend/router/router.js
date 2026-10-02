const { defaultHandler } = require("../services/defaultHandler.js")
const { login } = require("../services/auth.js")

function router() {

    const router = new Map();

    router.set('/', defaultHandler);
    router.set('/api/auth/login', login);
    // router.set('/api/auth/logout', logoutHandler);

    return router

}

const InstanceRouter = router()

module.exports = { InstanceRouter: InstanceRouter }