let ObjectId = require("mongodb").ObjectId;
const logger = require('winston');
const ActivityLogs = require('../../library/helper/ActivityLog')
const ProductActivityLogs = async (NewPayload, OldPayload) => {
  let description = [];
  try {
    //console.log(NewPayload,"------NewPayload");
    //console.log(OldPayload,"OldPayload");
    if (Object.keys(NewPayload).length == Object.keys(OldPayload).length) {
      for (var [key, value] of Object.entries(OldPayload)) {
        //console.log(typeof value, "----", key)
        if (typeof value === 'object' && key!="item" && Object.keys(OldPayload[key]).length>0) {
          //console.log(Array.isArray(value), "----", key)
          const tempdescription = await ProductActivityLogs(NewPayload[key],OldPayload[key]);
          if (tempdescription.length > 0) {
            description.push(...tempdescription);
          }
        } else {
          let log = {};
          let Ids = Object.keys(OldPayload).map(s => {
            if (s=="size") {
              return s
            }
          })
          
          if(typeof OldPayload[key] === 'object' && key =="item"){
           //console.log(NewPayload[key],"------NewPayload");
            //console.log(OldPayload[key],"OldPayload");
            let temp=await ProductActivityLogs(NewPayload[key],OldPayload[key])
            if(temp && Ids[0] != undefined)
            {
              description.push(...temp.map(item=>{
                var a=item;
                a[Ids[0]]=NewPayload[Ids[0]]==undefined? OldPayload[Ids[0]]:NewPayload[Ids[0]] ;
                return a
              }))
            }
          }
          else if (OldPayload[key].toString() != NewPayload[key]) {
            if (key.includes('id')||key=="size") {
              log["key"] = key,
                log["old"] = OldPayload[key],
                log["new"] = NewPayload[key]
            }
            else {
              if (Ids[0] != undefined) { log[Ids[0]] = NewPayload[Ids[0]]==undefined? OldPayload[Ids[0]]:NewPayload[Ids[0]]  }
              log["key"] = key,
                log["old"] = OldPayload[key].toString(),
                log["new"] = NewPayload[key]
            }
            description.push(log)
          }
        }
      }
    }
    else if (Object.keys(NewPayload).length > Object.keys(OldPayload).length) {
      for (var [key, value] of Object.entries(NewPayload)) {
        if (typeof value === 'object' && key!='item' && Object.keys(NewPayload[key]).length>0) {
          let tempdescription;
          //console.log(OldPayload[key], "----", key)
          if (OldPayload[key] == undefined) {
            tempdescription = await ProductActivityLogs(NewPayload[key], []);
          }
          else {
            tempdescription = await ProductActivityLogs(NewPayload[key], OldPayload[key]);
          }
          if (tempdescription.length > 0) {
            description.push(...tempdescription);
          }
        }
        else {
          let Ids = Object.keys(NewPayload).map(s => {
            if (s=="size") {
              return s

            }
          })
          let log = {};
          if(typeof NewPayload[key] === 'object' && key =="item"){
            let temp=await ProductActivityLogs(NewPayload[key],OldPayload[key]==undefined?[]:OldPayload[key])
            //console.log(temp,"-------------temp")
            if(temp && Ids[0] != undefined)
            {
              description.push(...temp.map(item=>{
                var a=item
                a[Ids[0]]=NewPayload[Ids[0]]==undefined? OldPayload[Ids[0]]:NewPayload[Ids[0]] ;
                return a
              }))
            }
          }
          else if (OldPayload[key] === undefined||NewPayload[key] != OldPayload[key].toString()) {
           
            if (key.includes('id')||key=="size") {
              log["key"] = key,
                log["old"] = OldPayload[key] === undefined ?null:OldPayload[key],
                log["new"] = NewPayload[key]
            }
            else {
              
              if (Ids[0] != undefined) { log[Ids[0]] = NewPayload[Ids[0]] }
              log["key"] = key,
                log["old"] = OldPayload[key] === undefined ?null:OldPayload[key],
                log["new"] = NewPayload[key]
            }
            description.push(log)
          }
        }
      }
    }
    else {
      for (var [key, value] of Object.entries(OldPayload)) {

        if (typeof value === 'object' && key!='item' && Object.keys(OldPayload[key]).length>0) {
          let tempdescription;
          //console.log(OldPayload[key],"----",key)
          if (NewPayload[key] == undefined) {
            tempdescription = await ProductActivityLogs([], OldPayload[key]);
          }
          else {
            tempdescription = await ProductActivityLogs(NewPayload[key], OldPayload[key]);
          }
          if (tempdescription.length > 0) {
            description.push(...tempdescription);
          }
        }
        else {
          let log = {};
          let Ids = Object.keys(OldPayload).map(s => {
            if (s=="size") {
              return s

            }
          })
          if(typeof OldPayload[key] === 'object' && key =="item"){
            let temp=await ProductActivityLogs(NewPayload[key]==undefined?[]:NewPayload[key],OldPayload[key])
            if(temp && Ids[0] != undefined)
            {
            
              description.push(...temp.map(item=>{
                var a=item
                a[Ids[0]]=NewPayload[Ids[0]]==undefined? OldPayload[Ids[0]]:NewPayload[Ids[0]] ;
                return a
              }))
            }
          }
          else if (NewPayload[key] == undefined || NewPayload[key] != OldPayload[key].toString()) {
            if (key.includes('id')||key=="size") {
              log["key"] = key,
                log["old"] = OldPayload[key].toString(),
                log["new"] = NewPayload[key] == undefined?null:NewPayload[key]
            }
            else {
              
              //console.log(NewPayload)
              if (Ids[0] != undefined) { log[Ids[0]] =  NewPayload[Ids[0]]==undefined? OldPayload[Ids[0]]:NewPayload[Ids[0]] }
              log["key"] = key,
                log["old"] = OldPayload[key].toString(),
                log["new"] = NewPayload[key] == undefined?null:NewPayload[key]
            }
            description.push(log)
          }
        }
      }
    }
    //console.log(description);
    return description;
  }
  catch (e) {
    console.log(e);
    logger.error(e.message);
    return description;
  }
};
 
module.exports = { ProductActivityLogs };
