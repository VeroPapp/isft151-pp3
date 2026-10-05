const { calcularHashSHA256 } = require("../helpers/hash.js")

const sessionsByUsers = new Map();  // clave(email) -> valor(token) 
const listSessions = new Map();  // clave(token) -> valor(objeto sesion) 

class UserSession {
    constructor() {
        this.status = 'disabled';
        this.hash = null
        this.role = null
        this.userEmail = null
        this.userId = null
    }

    async setHash(idUser, email) {
        let cadena = `${idUser}:${email}`
        const result = await calcularHashSHA256(cadena)
        this.hash = result
        this.userEmail = email
        this.userId = idUser
        return this.hash
    }

    getHash() {
        return this.hash
    }

    setRole(role) {
        this.role = role
    }

    getRole() {
        return this.role
    }

    setStatus(status) {
        this.status = status
    }

    getStatus() {
        return this.status
    }

    getEmail() {
        return this.userEmail
    }

}


module.exports = { listSessions, UserSession, sessionsByUsers }