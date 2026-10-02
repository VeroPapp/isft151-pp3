// Función para calcular el hash SHA-256 de una cadena
async function calcularHashSHA256(cadena) {
    // * creo un objeto para convertir la cadena a un formato de bytes
    const encoder = new TextEncoder();
    // * convierto la cadena a un array de bytes
    const data = encoder.encode(cadena);
    // * aplico el algoritmo SHA-256 al array de bytes y obtengo el resultado como un array de bytes
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    // * transformo el array de bytes en un array de números
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // * convierto el array de números en una cadena hexadecimal
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}


module.exports = { calcularHashSHA256: calcularHashSHA256 }