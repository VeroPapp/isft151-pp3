function validateChangePassword(password) {
    if (password.length < 8) return false;

    let tieneMayuscula = false;
    let tieneMinuscula = false;
    let tieneNumero = false;
    let tieneEspecial = false;

    const caracteresEspeciales = "!@#$%^&*(),.?\":{}|<>_+-=";

    for (let car of password) {
        // 1. Validar si es un número del '0' al '9' de forma exacta
        if (car >= '0' && car <= '9') {
            tieneNumero = true;
        }
        // 2. Validar si es un carácter especial de tu lista
        else if (caracteresEspeciales.includes(car)) {
            tieneEspecial = true;
        }
        // 3. Validar si es una letra mayúscula (A-Z)
        else if (car >= 'A' && car <= 'Z') {
            tieneMayuscula = true;
        }
        // 4. Validar si es una letra minúscula (a-z)
        else if (car >= 'a' && car <= 'z') {
            tieneMinuscula = true;
        }
    }

    return tieneMayuscula && tieneMinuscula && tieneNumero && tieneEspecial;
}


// Ejemplo de uso:
// * console.log(validarContrasenaSencilla("Abc1234!")); // true
// * console.log(validarContrasenaSencilla("solonumeros123")); // false

module.exports = { validateChangePassword }
