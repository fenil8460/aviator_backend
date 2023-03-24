const jwt = require('jsonwebtoken');
const config = require('../config');
const Joi = require("joi");
global.socketConnection = []

const userValid = Joi.object({
    userId: Joi.string().required().description('userId is required')
}).unknown();

exports.sockets = global.socketConnection;

exports.authenticate = async (socket, next) => {
    try {
        if (socket.handshake.headers && socket.handshake.headers.authorization) {
            const validateUser = await jwt.verify(socket.handshake.headers.authorization, config.auth.authKey);
            if (validateUser) {
                const { error, value } = await userValid.validate(validateUser)
                if (error) {
                    return next(new Error(error));
                }

                global.socketConnection.push({
                    ...value,
                    socketId: socket.id,
                    socket: socket
                })
                
                next();
            } else {
                return next(new Error('Authentication error'));
            }
        }
        else {
            next(new Error('Authentication error'));
        }
    } catch (error) {
        console.log(error)
        next(new Error(error.message));
    }
}

exports.disconnected = async (io, socket) => {
    try {
        const users = await socketConnection.map(item => item.socketId)
        const index = users.indexOf(socket.id);
        if (index > -1) {
            socketConnection.splice(index, index + 1);
        }
    } catch(error) {
        console.log("disconnect socket error ----> ", error)
    }
}