const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendWelcomeEmail(email, name) {
    const mailOptions = {
        from: '"Comunidad Activa" <info@comunidadactiva.com>',
        to: email,
        subject: '¡Bienvenido a Comunidad Activa!',
        text: `Hola ${name}, tu solicitud ha sido aprobada. Tu contraseña temporal es tu DNI.`,
        html: `<h3>¡Hola ${name}!</h3><p>Tu solicitud ha sido aprobada por el administrador.</p><p>Ya podés iniciar sesión en el sistema usando tu <b>DNI</b> como contraseña temporal. El sistema te pedirá que la cambies en tu primer ingreso.</p><p>¡Bienvenido/a al club!</p>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Correo enviado con éxito: %s", info.messageId);
        console.log("Ver correo (Ethereal): %s", nodemailer.getTestMessageUrl(info));
        return true;
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        return false;
    }
}

module.exports = { sendWelcomeEmail };