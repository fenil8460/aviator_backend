'use strict'

const Joi = require('joi');
const logger = require('winston');
const locals = require('../../locales');
const usersCollection = require("../../models/users")
let ObjectId = require('mongodb').ObjectId;
const duplicatEmail = require('./CheckEmailExists')
const PostPatchPayload = require('../../library/helper/PostPatchPayload');
const moment = require('moment');
const clientDB = require("../../models/mongodb")
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
    name: Joi.string().required().description(locals['users'].Post.fieldsDescription.name),
    password: Joi.string().required().description(locals['users'].Post.fieldsDescription.password),
    email: Joi.string().required().description(locals['users'].Post.fieldsDescription.email),
    gender: Joi.string().description(locals['users'].Post.fieldsDescription.gender).valid('Male', 'Female', 'Other'),
    type: Joi.string().required().default('dummy').description(locals['users'].Post.fieldsDescription.type).valid("real","dummy"),
    // role: Joi.string().required().default('user').description(locals['users'].Post.fieldsDescription.role).valid('admin','superadmin','user'),
    status: Joi.boolean().description(locals['users'].Post.fieldsDescription.status),
    ban: Joi.boolean().description(locals['users'].Post.fieldsDescription.status),
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

            const getUser = await usersCollection.SelectOne({
                _id: ObjectId(req.query.userId)
            });

            let body = {}
            if (getUser.email != payload.email) {
                if (await duplicatEmail.IsExists(payload.email)) {
                    code = 409;
                    response.message = locals['users'].Post.error.EmailExists;
                    return;
                }
                else{
                    body["active"]=false;
                }
            }
            body = await PostPatchPayload.ObjectPayload(req, 'patch');
            const user = await usersCollection.Update({
                _id: ObjectId(req.query.userId)
            }, body, dbSession);
            code = 200
            response.message = locals["genericErrMsg"]["200"]
            response.data = user
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