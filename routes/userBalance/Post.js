'use strict'

const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
const logger = require('winston');
const locals = require('../../locales');
const AddUserBaalance = require('./AddUserBalance');
const PostPatchPayload = require('../../library/helper/PostPatchPayload');
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
    userId: Joi.string().required().description(locals['users'].Post.fieldsDescription.name),
    balance: Joi.number().required().description(locals['users'].Post.fieldsDescription.password),
    type: Joi.string().required().description(locals['users'].Post.fieldsDescription.type).valid("real", "dummy"),
}).unknown(false);

const handler = async (req, res) => {
    try {
        let payload= req.payload;
        if(await AddUserBaalance.addBalance(payload.userId,payload.balance,payload.type))
        {
            return res.response({
                message: "Balance added successfully",
            }).code(200);
        }
        else{
            return res.response({
                message: "Balance not added",
            }).code(500);
        }
    } catch (e) {
        console.log(e)
        logger.error(e.message)
        return res.response({ message: locals["genericErrMsg"]["500"] }).code(500);
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