const logger = require('winston');
const gameCollection = require("../../models/games")
exports.getCurrentGame = async () => {
  try {
    let Game = await gameCollection.SelectOne({}, { _id: -1 }, 1);
    if(Game[0])
    return Game[0]
    else
    return null
  }
  catch (e) {
    console.log(e);
    logger.error(e.message)
  }
};
