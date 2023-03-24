'use strict'

const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
const logger = require('winston');
const locals = require('../../locales');
const userCollection = require("../../models/users")
const config = require('../../config')
const sms = require('../../library/sms')
const moment = require('moment');
const { ObjectId } = require('mongodb');
const activityLogCollection = require('../../models/activitylogs');
const GetRequestedUser = require('../../library/helper/GetRequestedUser');
const duplicatEmail = require('./CheckEmailExists')
const bcrypt = require('bcryptjs');
const PostPatchPayload = require('../../library/helper/PostPatchPayload');
const clientDB = require("../../models/mongodb");
const AddUserBaalance = require('../userBalance/AddUserBalance');
const SendUserVerifycationEmail = require('./SendUserVerifycationEmail');
const { payload } = require('@hapi/hapi/lib/validation');
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
    name: Joi.string().required().description(locals['users'].Post.fieldsDescription.name),
    password: Joi.string().required().description(locals['users'].Post.fieldsDescription.password),
    email: Joi.string().required().description(locals['users'].Post.fieldsDescription.email),
    url: Joi.string().required().description(locals['signIn'].Post.fieldsDescription.email),
    gender: Joi.string().description(locals['users'].Post.fieldsDescription.gender).valid('Male', 'Female', 'Other'),
    type: Joi.string().default('dummy').description(locals['users'].Post.fieldsDescription.type).valid("real", "dummy"),
    role: Joi.string().default('user').description(locals['users'].Post.fieldsDescription.role).valid('admin', 'user')
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
    let userResult;
    try {
        await dbSession.withTransaction(async () => {
            const AuthUser = await GetRequestedUser.User(req.headers.authorization);
            let payload = req.payload, userNumber, user;
            if (await duplicatEmail.IsExists(payload.email)) {
                code = 409;
                response.message = locals['users'].Post.error.EmailExists;
                return;
            }
            do {
                userNumber = String(Math.floor(Math.random() * 1000)).concat('-', String(Math.floor(Math.random() * 1000)).concat('-', String(Math.floor(Math.random() * 1000))));
                //console.log(productId ,"-----", productId.length);
                user = userCollection.Select({ userNumber: userNumber })
            } while (user.length || userNumber.length != 11)
            payload = await PostPatchPayload.ObjectPayload(req, 'post');
            payload.password = bcrypt.hashSync(payload.password, 10);
            payload["userNumber"] = userNumber;
            payload["active"] = false,
                payload["ban"] = false;
            userResult = await userCollection.Insert(payload, dbSession);

            let logs = {};
            logs['description'] = `user ${payload.name} is register `;
            logs['type'] = "USER"
            logs['status'] = true;
            logs['itemId'] = ObjectId("" + userResult.insertedIds[0]);
            logs['createdBy'] = AuthUser?.userId ? ObjectId(AuthUser.userId) : "",
                logs['createAt'] = moment().format();
            const logsResult = await activityLogCollection.Insert(logs, dbSession);
            code = 200;
            response.message = locals["genericErrMsg"]["200"];
            response.data = userResult;
        }, transactionOptions);
        if (userResult?.insertedIds[0]) {
            await AddUserBaalance.addBalance(userResult.insertedIds[0],0,payload.type);
            let user = await userCollection.SelectOne({ _id: ObjectId(userResult.insertedIds[0]) });
            await SendUserVerifycationEmail.sendmail(user, req.payload.url);
        }
        return res.response(response).code(code);
    } catch (e) {
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