'use strict'

const Joi = require('joi');
const logger = require('winston');
const locals = require('../../locales');
const usersCollection = require("../../models/users")
let ObjectId = require('mongodb').ObjectId;
const PostPatchPayload = require('../../library/helper/PostPatchPayload');
const crypto = require('crypto');
const bankDetailCollection = require("../../models/bankDetails")
const clientDB = require("../../models/mongodb");
const duplicatMethodExits = require('./CheckMethodExits')
const fs = require('fs');
const path = require("path");
const bankDetails = require('.');
/**
 * @description post a new category
 * @property {string} authorization - authorization
 * @property {string} lang - language
 * @property {string} categoryName - for select specific category details
 * @returns 200 : Success
 * @returns 500 : Internal Server Error
 * 
 * @author Jarun Borada
 * @date 02-July-2022
 */

const queryvalidator = Joi.object({
    bdId: Joi.string().required().description(locals['users'].Post.fieldsDescription.userId)
}).unknown();

const validator = Joi.object({
    image: Joi.any()
        .meta({ swaggerType: 'file' })
        .optional()
        .allow('')
        .description('image file'),
    details:Joi.any(),
    method:Joi.string(),
    status:Joi.boolean()
}).unknown(false);

const handler = async (req, res) => {
    const client = await clientDB.getClient();
    const dbSession = await client.startSession()

    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };
    let code;
    let response = {}
    try {
        await dbSession.withTransaction(async () => {
            let payload = JSON.parse(req.payload?.details);
            req.payload["details"]= payload;
            if (req.payload.method && await duplicatMethodExits.IsExists(req.payload.method)) {
                code = 409;
                response.message = "method exits";
                return;
            }
            const getbankDetails = await bankDetailCollection.SelectOne({
                _id: ObjectId(req.query.bdId)
            });
            if(req.payload?.image){
            const rawBytes = crypto.randomBytes(16)
            const imageName = rawBytes.toString('hex')+".png"
            const imgPath = path.join(__dirname, '/../../public/' + imageName)
            const buffer = Buffer.from(req.payload.image, "base64");
            fs.writeFileSync(imgPath, buffer);
            delete req.payload.image;
            req.payload["imageName"]=imageName;
            }
           let body = await PostPatchPayload.ObjectPayload(req, 'patch');
           console.log(body)
            if (getbankDetails) {
            if(fs.existsSync(path.join(__dirname, '/../../public/' +getbankDetails.imageName)))
                fs.unlinkSync(path.join(__dirname, '/../../public/' +getbankDetails.imageName));
            let bankDetails= await bankDetailCollection.Update({
                    _id: ObjectId(req.query.bdId)
                }, body, dbSession);
            code = 200
            response.data=bankDetails
            response.message = locals["genericErrMsg"]["200"]
            return;
            }
            else{
                code = 204
                response.message = locals["genericErrMsg"]["204"]
            }
        }, transactionOptions);
        return res.response(response).code(code);
    } catch (e) {
        console.log(e)
        logger.error(e.message)
        return res.response({
            message: locals["genericErrMsg"]["500"]
        }).code(500);
    }
    finally {
        dbSession.endSession();
    }
}

const response = {
    status: {
        401: Joi.object({ message: Joi.any().default(locals["genericErrMsg"]["401"]) }),
        200: Joi.object({ message: Joi.any().default(locals["genericErrMsg"]["200"]), data: Joi.any() }),
        500: Joi.object({ message: Joi.any().default(locals["genericErrMsg"]["500"]) }),
    }
}

module.exports = { validator, queryvalidator, response, handler }