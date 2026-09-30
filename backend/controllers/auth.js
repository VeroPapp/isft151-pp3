const { loginService, logoutService } = require("../services/auth.js")

function loginHandler(request, response) {

    let body = ""

    request.on("data", chunk => {
        body += chunk.toString()
    })

    request.on("end", async () => {
        try {

            request.body = JSON.parse(body)

            const result = loginService(request, response)
            console.log(result.data);

            response.writeHead(200, { "Content-Type": "application/json" })
            response.end(JSON.stringify(result))

        } catch (error) {

            const type = error.type || "ErrorInternServer"
            let message = null
            let code = null

            switch (type) {
                case "ErrorAuthentication":
                    message = error.getMessage()
                    code = error.getCode()
                    break;
                case "ErrorSpecification":
                    message = error.getMessage()
                    code = error.getCode()
                    break;
                case "ErrorDomain":
                    message = error.getMessage()
                    code = error.getCode()
                    break;
                case "ErrorInternServer":
                    message = error.message
                    code = 500
                    break;
            }

            response.writeHead(code, { "Content-Type": "application/json" })
            response.end(JSON.stringify(message))
        }
    })

}


function logoutHandler(request, response) {
    
}


module.exports = { loginHandler, logoutHandler }