const { CurrentGame,UserBid,GameStatus } = require('./game')

exports.socketmethods = (socket) => {
    socket.on("CurrentGame", CurrentGame)
    socket.on("UserBid", UserBid)
    socket.on("GameStatus", GameStatus)
}