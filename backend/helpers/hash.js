// Función para calcular el hash SHA-256 de una cadena
async function calcularHashSHA256(cadena) {
    const encoder = new TextEncoder();
    const data = encoder.encode(cadena);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}


module.exports = { calcularHashSHA256: calcularHashSHA256 }