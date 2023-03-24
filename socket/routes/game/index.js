let ObjectId = require("mongodb").ObjectId;
const logger = require('winston');
const moment = require("moment");
const gameCollection = require("../../../models/games");
const { getCurrentGame } = require('../../../library/helper/GetCurrentGame');
const parallel = require('run-parallel')
exports.CreateGame = async () => {
    try {
        let data = {
            _id: new ObjectId(),
            status: "pending",
            totalamount: 0,
            user: [],
            userWithdraw: [],
            createAt: moment().format(),
            completed: ""
        }
        global.game = data
        global?.socketConnection?.map(item => {
            item?.socket?.emit("GameStatus", global.game["status"])
        })
        gameCollection.Insert(data)
        setTimeout(() => {
            global.game["status"] = "started"
            global?.socketConnection?.map(item => {
                item?.socket?.emit("GameStatus", global.game["status"])
            })
            gameCollection.Update({
                _id: global.game["_id"]
            }, { status: "started" });
        }, 5000)
    }
    catch (e) {
        logger.error(e.message)
    }
};
exports.getExistingGame = async () => {
    try {
        if (isNaN(global.game)) {
            let exisGame = await gameCollection.SelectOne({}, { _id: -1 }, 1);
            exisGame = exisGame[0]
            if (exisGame && exisGame?.status !== "completed") {
                global.game = exisGame
            }
            else {
                this.CreateGame()
            }
        }
    }
    catch (e) {
        console.log(e);
        logger.error(e.message)
    }
};
exports.CurrentGame = async ({ socket }) => {
    try {
        let CurrentGame;
        if (isNaN(global.game)) {
            CurrentGame = await getCurrentGame()
            global.game = CurrentGame
        }
        else {
            CurrentGame = global.game
        }
        socket.emit("CurrentGame", CurrentGame)
    }
    catch (e) {
        console.log(e);
        logger.error(e.message)
    }
};
exports.UserBid = async ({ socket, payload }) => {
    try {
        let CurrentGame;
        if (isNaN(global.game)) {
            CurrentGame = await getCurrentGame()
            global.game = CurrentGame

        }
        let useramount = payload.amount
        let totalamount = global.game["totalamount"]
        global.game["totalamount"] = totalamount + payload.amount
        global.game["user"].push({
            userId: ObjectId(payload.userId),
            amount: useramount
        })
        socket.emit("UserBid", global.game)
        gameCollection.Update({
            _id: ObjectId(global.game["_id"])
        }, global.game)

    }
    catch (e) {
        console.log(e);
        logger.error(e.message)
    }
};
exports.GameStatus = async ({ socket }) => {
    try {
    socket.emit("GameStatus",global.game["status"])      
    }
    catch (e) {
        console.log(e);
        logger.error(e.message)
    }
};