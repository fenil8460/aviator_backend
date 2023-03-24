'use strict'

const Joi = require('joi')

const envVarsSchema = Joi.object({
    SMS_URL: Joi.string().required(),
    SMS_TOKEN: Joi.string().required(),
    SMS_SENDER: Joi.string().required()
}).unknown().required()

const { error, value: envVars } = envVarsSchema.validate(process.env)

if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

const config = {
    sms: {
        url: envVars.SMS_URL,
        token: envVars.SMS_TOKEN,
        sender: envVars.SMS_SENDER
    }
}

module.exports = config