
const users = require('./users')
const auth = require('./auth')
const userbalance = require('./userBalance')
const activityLog = require('./activityLog')
const bankDetails = require('./bankDetails')

module.exports = [].concat(
    users,
    auth,
    userbalance,
    activityLog,
    bankDetails
)