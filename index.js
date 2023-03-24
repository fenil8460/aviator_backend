const Hapi = require("@hapi/hapi");
require("dotenv").config({ path: "./.env" });
const logger = require("winston");
const config = require("./config");
const path = require("path");
const middleware = require("./middleware");
const db = require("./models/mongodb");
const socket = require("./socket/")
const Server = Hapi.Server({
    host: config.server.host,
    port: config.server.port,
    routes: {
        files: {
            relativeTo: path.join(__dirname, "public"),
        },
    },
});
Server.realm.modifiers.route.prefix = "/v1";

const initialize = async () => {
    try {
        await Server.register([
            middleware.good,
            middleware.swagger.inert,
            middleware.swagger.vision,
            middleware.swagger.swagger,
            middleware.auth,
        ]);

        await socket.connection()

        Server.route({
            method: "GET",
            path: "/file/{fileName}",
            handler: function (request, h) {
                console.log(request.params);
                return h.file(request?.params?.fileName);
            },
        });

        Server.route(require("./routes/index"));

        const server = await Server.start();
        if (!server) {
            logger.info(`Server is listening on port - ${config.server.port}`);
        }
        await db.connect();
        
    } catch (e) {
        console.log(e);
        logger.error(e.message);
    }
};

initialize();
