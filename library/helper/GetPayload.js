let ObjectId = require("mongodb").ObjectId;
const moment = require('moment');
const ObjectPayload = async (Payload, type) => {
  let lookupcondition = [];
  try {
    const limit = Payload.limit ? Payload.limit : 20;
    const start = Payload.page ? (Payload.page - 1) * limit : 0;
    let condition = [];
    if (Payload.page >= 0) {
      delete Payload.page;
    }
    if (Payload.limit >= 0) {
      delete Payload.limit;
    }
    switch (type) {
      case "user":
        if (Payload["userId"]) {
          Payload["_id"] = ObjectId(Payload["userId"]);
          delete Payload["userId"];
        }
        break;
      case "type":
        if (Payload["typeId"]) {
          Payload["_id"] = ObjectId(Payload["typeId"]);
          delete Payload["typeId"];
        }
        break;
      case "userBalance":
        if (Payload["BalanceId"]) {
          Payload["_id"] = ObjectId(Payload["BalanceId"]);
          delete Payload["itemId"];
        }
        break;
      case "bankDetails":
        if (Payload["bdId"]) {
          Payload["_id"] = ObjectId(Payload["bdId"]);
          delete Payload["bdId"];
        }
        lookupcondition.push({
          $lookup: {
            from: "products",
            let: { product: "$products" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$product"],
                  },
                },
              },
              {
                $project: {
                  name: 1,
                  description: 1,
                  color: 1,
                  image: 1,
                  status: 1,
                  productNumber: 1,
                },
              },
            ],
            as: "product",
          },
        });
        break;
      case "product":
        if (Payload["productId"]) {
          Payload["_id"] = ObjectId(Payload["productId"]);
          delete Payload["productId"];
        }
        lookupcondition.push({
          $lookup: {
            from: "items",
            localField: "items.item",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  description: 1,
                  sizes: 1,
                  image: 1,
                  status: 1,
                },
              },
            ],
            as: "item_info",
          },
        });
        break;
      case "customer":
        if (Payload["customerId"]) {
          Payload["_id"] = ObjectId(Payload["customerId"]);
          delete Payload["customerId"];
        }
        break;
      case "stock":
        if (Payload["stockId"]) {
          Payload["_id"] = ObjectId(Payload["stockId"]);
          delete Payload["stockId"];
        }
        break;
      case "activityLog":
        if (Payload["activityLogId"]) {
          Payload["_id"] = ObjectId(Payload["activityLogId"]);
          delete Payload["activityLogId"];
        }
        if (Payload["createdBy"]) {
          Payload["createdBy"] = ObjectId(Payload["createdBy"]);
        }
        if (Payload["fromDate"] && Payload["toDate"]) {
          Payload['toDate'] = moment(Payload["toDate"],'YYYY-MM-DD').add(1,'days')
          lookupcondition.push({
            $match: {
              createAt: { $gte: Payload["fromDate"] },
              createAt: { $lte: moment(Payload["toDate"]).format('YYYY-MM-DD')}
            }
          })
          delete Payload["fromDate"];
          delete Payload["toDate"];
        }

        lookupcondition.push(
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "itemId",
              foreignField: "_id",
              as: "user",
            }
          },
          {
            $lookup: {
              from: "products",
              localField: "itemId",
              foreignField: "_id",
              as: "product",
            }
          },
          {
            $lookup: {
              from: "catalogs",
              localField: "itemId",
              foreignField: "_id",
              as: "catalog",
            }
          },
          {
            $lookup: {
              from: "orders",
              localField: "itemId",
              foreignField: "_id",
              as: "order",
            }
          },
          {
            $lookup: {
              from: "customers",
              localField: "itemId",
              foreignField: "_id",
              as: "customer",
            }
          },
          {
            $lookup: {
              from: "items",
              localField: "itemId",
              foreignField: "_id",
              as: "item",
            }
          },
          {
            $project: {
              description: 1,
              type: 1,
              status: 1,
              createdBy: 1,
              createAt: 1,
              item_info: {
                $cond: {
                  if: { $gte: [{ $size: "$user" }, 1] }, then: '$user', else: {
                    $cond: {
                      if: { $gte: [{ $size: "$order" }, 1] }, then: '$order', else: {
                        $cond: {
                          if: { $gte: [{ $size: "$item" }, 1] }, then: '$item', else: {
                            $cond: {
                              if: { $gte: [{ $size: "$customer" }, 1] }, then: '$customer', else: {
                                $cond: {
                                  if: { $gte: [{ $size: "$product" }, 1] }, then: '$product', else: {
                                    $cond: {
                                      if: { $gte: [{ $size: "$catalog" }, 1] }, then: '$catalog', else: []
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                    }
                  }
                }
              }
            },
          },
          { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
          { $unwind: { path: "$item_info", preserveNullAndEmptyArrays: true } }
        );
        break;
      case "order":
        if (Payload["orderId"]) {
          Payload["_id"] = ObjectId(Payload["orderId"]);
          delete Payload["orderId"];
        }
        lookupcondition.push(
          {
            $lookup: {
              from: "customers",
              localField: "customerId",
              foreignField: "_id",
              as: "customer",
            },
          },
          {
            $unwind: {
              path: "$customer",
            },
          },
          {
            $lookup: {
              from: "catalogs",
              let: { catalog: "$catalogs" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ["$_id", "$$catalog.catalogue_id"],
                    },
                  },
                },
                {
                  $project: {
                    name: 1,
                    description: 1,
                    price: 1,
                    HSN: 1,
                    image: 1,
                    products: 1,
                    status: 1,
                    catalogNumber: 1,
                    quantity: { $first: "$$catalog.quantity" },
                  },
                },
              ],
              as: "catalog",
            },
          }
        );
        console.log(
          lookupcondition,
          "--------------------------------------------------"
        );
        break;
    }
    for (const key in Payload) {
      if (Payload[key] === null) {
        delete Payload[key];
        continue;
      }
      if (key.toLocaleLowerCase().includes("id")) {
        Payload[key] = ObjectId(Payload[key]);
      }
      if (key === "name") {
        condition.push({
          $match: { name: { $regex: Payload[key], $options: "i" } },
        });
      } else {
        condition.push({
          $match: {
            [key]: Payload[key],
          },
        });
      }
    }
    condition.push(...lookupcondition);
    condition.push(
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          [type]: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          [type]: { $slice: ["$" + [type], start, limit] },
        },
      }
    );
    return condition;
  } catch (e) {
    console.log(e);
    logger.error(e.message);
    return Payload;
  }
};
module.exports = { ObjectPayload };