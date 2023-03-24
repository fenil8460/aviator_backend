'use strict'

const Joi = require('joi');
const logger = require('winston');
const locals = require('../../locales');
const usersCollection = require("../../models/users")
let ObjectId = require('mongodb').ObjectId;
const AddUserBaalance = require('./AddUserBalance');
const PostPatchPayload = require('../../library/helper/PostPatchPayload');
const userBalanceCollection = require("../../models/userBalance");
const clientDB = require("../../models/mongodb");
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
    userId: Joi.string().required().description(locals['users'].Post.fieldsDescription.userId)
}).unknown();

const validator = Joi.object({
    balance: Joi.number().required().description(locals['users'].Post.fieldsDescription.password),
    type: Joi.string().required().description(locals['users'].Post.fieldsDescription.type).valid("real", "dummy"),
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
    const response = {}
    try {
        await dbSession.withTransaction(async () => {
            let payload = req.payload;
            const getUserBalance = await userBalanceCollection.SelectOne({
                userId: ObjectId(req.query.userId),
                type:payload.type
            });
            let userBalance;
           let body = await PostPatchPayload.ObjectPayload(req, 'patch');
            if (getUserBalance) {
               userBalance= await userBalanceCollection.Update({
                    userId: ObjectId(req.query.userId),type:payload.type
                }, body, dbSession);
            }
            else{
                console.log("done")
                if(!await AddUserBaalance.addBalance(req.query.userId,payload.balance,payload.type))
                {
                    code = 500
                    response.message = locals["genericErrMsg"]["500"]
                    return
                }
            }
            code = 200
            response.message = locals["genericErrMsg"]["200"]
            response.data = userBalance
        }, transactionOptions);
        return res.response(response).code(code);
    } catch (e) {
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