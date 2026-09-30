const { defaultHandler } = require("../controllers/defaultHandler.js")
const { loginHandler, logoutHandler } = require("../controllers/auth.js")

function routerAuth() {

    const routerAuth = new Map();

    routerAuth.set('/', defaultHandler);
    routerAuth.set('/api/auth/login', loginHandler);
    // routerAuth.set('/api/auth/logout', logoutHandler);

    return routerAuth

}

const InstanceRouterAuth = routerAuth()

module.exports = { InstanceRouterAuth: InstanceRouterAuth }