function defaultHandler(request, response) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(
            {
                message: 'vista cargada exitosamente, ejecutando /'
            }
        ));
    } catch (error) {
        console.log(error.message);
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify('Error interno: No se pudo cargar la vista principal.'));
    }
}


module.exports = { defaultHandler: defaultHandler };