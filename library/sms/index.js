const logger = require('winston');
const config = require('../../config');
const axios = require('axios')

exports.sendSMS = async (phoneNumber, message) => {
    try {

        return await axios.post(`${config.sms.url}sms/send`, {
            sender: config.sms.sender,
            to: phoneNumber,
            service: 'T',
            message: message
        }, {
            headers: {
                Authorization: config.sms.token
            }
        })
    } catch (error) {
        logger.log(error.message)
        return false
    }
}