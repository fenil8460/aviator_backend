'use strict'

const Joi = require('joi')

const envVarsSchema = Joi.object({
    FIREBASE_TYPE: Joi.string().required(),
    FIREBASE_PROJECT_ID: Joi.string().required(),
    FIREBASE_PRIVATE_KEY_ID: Joi.string().required(),
    FIREBASE_PRIVATE_KEY: Joi.string().required(),
    FIREBASE_CLIENT_EMAIL: Joi.string().required(),
    FIREBASE_CLIENT_ID: Joi.string().required(),
    FIREBASE_AUTH_URI: Joi.string().required(),
    FIREBASE_TOKEN_URI: Joi.string().required(),
    FIREBASE_AUTH_PROVIDER_x509_CERT_URL: Joi.string().required(),
    FIREBASE_CLIENT_x509_CERT_URL: Joi.string().required(),
    FIREBASE_BUCKET: Joi.string().required(),
}).unknown().required()

const { error, value: envVars } = envVarsSchema.validate(process.env)

if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

const config = {
    firebase: {
        type: envVars.FIREBASE_TYPE,
        project_id: envVars.FIREBASE_PROJECT_ID,
        private_key_id: envVars.FIREBASE_PRIVATE_KEY_ID,
        private_key: envVars.FIREBASE_PRIVATE_KEY,
        client_email: envVars.FIREBASE_CLIENT_EMAIL,
        client_id: envVars.FIREBASE_CLIENT_ID,
        auth_uri: envVars.FIREBASE_AUTH_URI,
        token_uri: envVars.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: envVars.FIREBASE_AUTH_PROVIDER_x509_CERT_URL,
        client_x509_cert_url: envVars.FIREBASE_CLIENT_x509_CERT_URL,
        bucket: envVars.FIREBASE_BUCKET
    }
}

module.exports = config