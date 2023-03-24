const { ObjectId } = require('mongodb');
const logger = require('winston');
const ObjectPayload = async (payload) => {
  let Payload = payload;
  try {
    for (const key in Payload) {
      if (Array.isArray(Payload[key]) || typeof Payload[key] === 'object') {
        Payload[key]= await ObjectPayload(Payload[key])
      }
      else {
        if (
          key.toLocaleLowerCase().includes("id") || Number.isInteger(parseInt(key))
        ) {
          Payload[key] = ObjectId(Payload[key]);
        }
      }
    }
    return Payload;
  } catch (e) {
    console.log(e);
    logger.error(e.message);
    return Payload;
  }
};

module.exports = { ObjectPayload };
