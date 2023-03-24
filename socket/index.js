const logger = require('winston');
const config = require('../config');
const Hapi = require('@hapi/hapi');
const { authenticate, disconnected } = require("./middleware");
const { socketmethods } = require("./routes");
const { getExistingGame } = require('./routes/game')
const parallel = require('run-parallel')

const server = new Hapi.Server({
    host: config.server.host,
    port: config.socket.port,
});

let io = require("socket.io")(server.listener)
// const encrypt = require('socket.io-encrypt');
// io.use(encrypt(config.socket.secret))

global.game = {}

exports.connection = async () => {
    try {
        io.on("connection", (socket) => {
            // imports all socket routes

            socketmethods(socket)
            // payload modification middleware
            socket.use((s, next) => {
                s[1] = {
                    payload: s?.[1],
                    socket: socket
                }
                next()
            })
            // method call whenever new connection establish
            socket.on("disconnect", () => disconnected(io, socket))
        })

        io.use(authenticate);

        const socketserver = await server.start();
        if (!socketserver) {
            logger.info(`Socket Server is listening on port - ${config.socket.port}`);
            parallel([
                // function () {
                //     let CurrentGameStatus = global.game["status"]
                //     setInterval(() => {
                //         if (CurrentGameStatus != global.game["status"] || true) {
                //             CurrentGameStatus = global.game["status"]
                //             global?.socketConnection?.map(item => {
                //                 item?.socket?.emit("GameStatus", CurrentGameStatus)
                //             })
                //         }
                //     }, 1000)
                // },
                function () {
                    setInterval(() => {
                        console.log("game---->", global.game)
                        getExistingGame()
                    }, 5000)
                }
            ])
        }
    } catch (error) {
        logger.log(error.message)
        return false
    }
}