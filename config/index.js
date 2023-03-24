'use strict'

const logger = require('./components/logger');
const mongodb = require('./components/mongo');
const server = require('./components/server');
const localization = require('./components/localization');
const sms = require('./components/sms');
const firebase = require('./components/firebase');

module.exports = Object.assign({}, logger, mongodb, server, localization, sms, firebase);