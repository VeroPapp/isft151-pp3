function validateChangePassword(password) {
    if (password.length < 8) return false;

    let tieneMayuscula = false;
    let tieneMinuscula = false;
    let tieneNumero = false;
    let tieneEspecial = false;

    const caracteresEspeciales = "!@#$%^&*(),.?\":{}|<>_+-=";

    for (let car of password) {
        if (car >= '0' && car <= '9') {
            tieneNumero = true;
        }
        else if (caracteresEspeciales.includes(car)) {
            tieneEspecial = true;
        }
        else if (car >= 'A' && car <= 'Z') {
            tieneMayuscula = true;
        }
        else if (car >= 'a' && car <= 'z') {
            tieneMinuscula = true;
        }
    }

    return tieneMayuscula && tieneMinuscula && tieneNumero && tieneEspecial;
}

module.exports = { validateChangePassword }
