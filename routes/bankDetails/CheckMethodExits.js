const bankDetailCollection = require("../../models/bankDetails")
const IsExists = async(method)=>
{
    let duplicatMethod = await bankDetailCollection.Aggregate([ 
        {
            $match: { method: { $regex: method, $options: 'i' } }
        },
        {
            $match: { status:true }
        }
    ])
    if(duplicatMethod.length)
        return true;
    else
        return false;
}
module.exports = { IsExists }