const { calcularHashSHA256 } = require("../helpers/hash.js");

class UserSession {
    constructor() {
        this.status = 'disabled';
        this.hash = null;
        this.role = null;
        this.userEmail = null;
        this.userId = null;
    }

    setHash(idUser, email) {
        let cadena = `${idUser}:${email}`;
        const result = calcularHashSHA256(cadena);
        this.hash = result;
        this.userEmail = email;
        this.userId = idUser;
    }

    getHash() {
        return this.hash;
    }

}

module.exports = { UserSession };