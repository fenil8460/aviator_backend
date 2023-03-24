const { ObjectId } = require('mongodb');
const userBalanceCollection = require("../../models/userBalance");
const userCollection = require("../../models/users")
const clientDB = require("../../models/mongodb");
const addBalance = async(userId,balance,type)=>
{
    const client = await clientDB.getClient();
    const dbSession = await client.startSession()

    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };
    try {
       
        await dbSession.withTransaction(async () => {
            let payload={
                userId:ObjectId(userId),
                balance:balance,
                type: type
            };
            if(type=='real'){
                console
                await userBalanceCollection.Delete({
                    userId: ObjectId(userId),type:'dummy'
                }, dbSession);
            }
            await userBalanceCollection.Insert(payload, dbSession);
        }, transactionOptions);
        return true;
    } catch (e) {
        console.log(e)
        logger.error(e.message)
        return false;
    }
    finally {
        await dbSession.endSession();
    }
   
}
module.exports = { addBalance }