const { calcularHashSHA256 } = require("../helpers/hash.js")

const listSessions = new Map();  //clave-valor  -> clave: email,  valor: sessionObj

class UserSession {
    constructor() {
        this.status = 'disabled';
        this.hash = null
    }

    async setHash(idUser, email) {
        let cadena = `${idUser}:${email}`
        const result = await calcularHashSHA256(cadena)
        this.hash = result
    }

    getHash() {
        return this.hash
    }

    setStatus(status) {
        this.status = status
    }

    getStatus() {
        return this.status
    }

}


module.exports = { listSessions, UserSession }