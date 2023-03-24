'use strict'

const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
const logger = require('winston');
const locals = require('../../locales');
const jwt = require('jsonwebtoken');
const userBalanceCollection = require("../../models/userBalance");
const GetPayload = require('../../library/helper/GetPayload');
const { ObjectId } = require('mongodb');
/**
 * @description get all or specifice category details
 * @property {string} authorization - authorization
 * @property {string} lang - language
 * @property {string} phoneNumber - for select specific user details
 * @property {string} email - for select specific user details
 * @returns 200 : Success
 * @returns 500 : Internal Server Error
 * 
 * @author Jarun Borada
 * @date 11-Dec-2020
 */

const validator = Joi.object({
    type: Joi.string().description(locals['users'].Post.fieldsDescription.type).valid("real", "dummy"),
    page: Joi.number().description(locals['users'].Get.fieldsDescription.page),
    limit: Joi.number().description(locals['users'].Get.fieldsDescription.limit),
    userId: Joi.string().description(locals['users'].Get.fieldsDescription.userId),
    BalanceId:Joi.string().description(locals['users'].Get.fieldsDescription.userId)
}).unknown();

const handler = async (req, res) => {
    try {
        const userBalanceResult = await userBalanceCollection.Aggregate(await GetPayload.ObjectPayload(req.query,'userBalance'))
        if (!userBalanceResult || !userBalanceResult.length) {
            return res.response({
                message: locals["genericErrMsg"]["204"]
            }).code(204);
        }

        return res.response({
            message: locals["genericErrMsg"]["200"], 
            data: userBalanceResult
        }).code(200);
    } catch (e) {
        logger.error(e.message)
        return res.response({
            message: locals["genericErrMsg"]["500"]
       }).code(500);
    } 
}

const response = {
    status: {
        401: Joi.object({ message: Joi.any().default(locals["genericErrMsg"]["401"]) }),
        200: Joi.object({ message: Joi.any().default(locals["genericErrMsg"]["200"]), data: Joi.any() }),
        204: Joi.object({ message: Joi.any().default(locals["genericErrMsg"]["204"]) }),
        500: Joi.object({ message: Joi.any().default(locals["genericErrMsg"]["500"]) }),
    }
}

module.exports = { validator, response, handler }