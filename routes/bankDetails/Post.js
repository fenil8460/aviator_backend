'use strict'

const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
const logger = require('winston');
const locals = require('../../locales');
const PostPatchPayload = require('../../library/helper/PostPatchPayload');
const crypto = require('crypto');
const bankDetailCollection = require("../../models/bankDetails");
const duplicatMethodExits = require('./CheckMethodExits')
const clientDB = require("../../models/mongodb");
const fs = require('fs');
const path = require("path");

/**
 * @description for user signIn
 * @property {string} authorization - authorization
 * @property {string} lang - language
 * @property {string} categoryName - for select specific category details
 * @returns 200 : Success
 * @returns 500 : Internal Server Error
 * 
 * @author Jarun Borada
 * @date 28-June-2022
 */

const validator = Joi.object({
    image: Joi.any()
        .meta({ swaggerType: 'file' })
        .optional()
        .allow('')
        .description('image file'),
    details:Joi.any().required(),
    method:Joi.string().required()
}).unknown(false);

const handler = async (req, res) => {
    const client = await clientDB.getClient();
    const dbSession = await client.startSession()

    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };
    var code;
    const response = {}
    let bankDetailsResult;
    try {
        await dbSession.withTransaction(async () => {
            if (await duplicatMethodExits.IsExists(req.payload.method)) {
                code = 409;
                response.message = "method exits";
                return;
            }
            let payload = JSON.parse(req.payload?.details);
            req.payload["details"]= payload;
            const rawBytes = crypto.randomBytes(16)
            const imageName = rawBytes.toString('hex')+".png";
            if (!fs.existsSync(path.join(__dirname, '/../../public/'))) {
                fs.mkdirSync(path.join(__dirname, '/../../public/'));
              }
            const imgPath = path.join(__dirname, '/../../public/' + imageName)
            const buffer = Buffer.from(req.payload.image, "base64");
            fs.writeFileSync(imgPath, buffer);
            delete req.payload.image;
            payload = await PostPatchPayload.ObjectPayload(req, 'post');
            payload["imageName"]=imageName;
            // payload["URL"]="public/"+imageName;
            bankDetailsResult = await bankDetailCollection.Insert(payload, dbSession);
            response.data = bankDetailsResult;
            code=200;
            response.message = locals["genericErrMsg"]["200"];
        }, transactionOptions);
        return res.response(response).code(code);
    }  catch (e) {
        console.log(e)
        logger.error(e.message)
        return res.response({ message: locals["genericErrMsg"]["500"] }).code(500);
    }
    finally {
        ''
        await dbSession.endSession();
    }
}

const response = {
    status: {
        409: Joi.object({ message: Joi.any().default(locals["genericErrMsg"]["409"]) }),
        200: Joi.object({ message: Joi.any().default(locals["genericErrMsg"]["200"]), data: Joi.object() }),
        500: Joi.object({ message: Joi.any().default(locals["genericErrMsg"]["500"]) }),
    }
}

module.exports = { validator, response, handler }