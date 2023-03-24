'use strict'

const Promise = require("bluebird");
const mongo = Promise.promisifyAll(require('../mongodb'))

const tablename = 'authUser'

const SelectOne = async (data) => {
    const db = await mongo.get();
    return await db.collection(tablename).findOne(data)
};

const Insert = async (data) =>{
    const db = await mongo.get();
    return await db.collection(tablename).insert(data)
}

module.exports = {
    SelectOne,
    Insert
}
