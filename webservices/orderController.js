const User = require('../models/userModel');
const Response = require('../common_functions/response_handler');
const imageUpload = require('../common_functions/uploadImage');
const responseCode = require('../helper/httpResponseCode');
const responseMessage = require('../helper/httpResponseMessage');
const message = require('../common_functions/message');
const waterfall = require('async-waterfall');
const config = require('../config/config')();
const each = require('async-each-series');
const cloudinary = require('../common_functions/uploadImage');
const async = require('async');
const mongoose = require('mongoose')
const validators = require('../middleware/validators')
const Laundry = require('../models/laundryModel')
const Item = require('../models/itemModel')
const Order = require('../models/orderModel')

const orderApis = {

    //=================================================== increment decrement cart item ===================================================
    // 'incDecInItem': (req, res) => {
    //     console.log("req. for inc/dec in quantity" + JSON.stringify(req.body))
    //     if (!req.body)
    //         Response.sendResponseWithoutData(res, responseCode.WENT_WRONG, "Fill the details.")
    //     else {
    //         var type = (req.body.type);
    //         let obj = type === "inc" ? { $inc: { "orderDetails.$.quantity": 1 } } : { $inc: { "orderDetails.$.quantity": -1 } }
    //         console.log("Increment object is" + JSON.stringify(obj))
    //         Order.update({ customerId: req.body.customerId, "orderDetails.itemId": mongoose.Types.ObjectId(req.body.itemId) }, obj, (err, result) => {
    //             console.log('inc dec err result=======>>,',err,result)
    //             if (err) {
    //                 Response.sendResponseWithData(res, responseCode.WENT_WRONG, responseMessage.INTERNAL_SERVER_ERROR, error)
    //             }
    //             else {
    //                 Response.sendResponseWithoutData(res, responseCode.EVERYTHING_IS_OK, "Order updated successfully.")
    //             }
    //         })
    //     }
    // },

    //========================================== place order in app =========================================================================
    // 'placeOrder': (req, res) => {
    //     if (!req.body)
    //         Response.sendResponseWithoutData(res, responseCode.WENT_WRONG, "Fill the data.")
    //     else { //
    //         // async.waterfall([(callback) => {
    //             Order.count({}, (err, result) => {
    //                 if (err) {
    //                     console.log('err 1------------------->>', err)
    //                     Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
    //                 }
    //                 else {
    //                     var orderNo;
    //                     if (result == 0 ? orderNo = 1000 : orderNo = result + 1000)
    //                         var order = new Order({
    //                             orderNo: orderNo,
    //                             orderDetails: [{ itemId: req.body.itemId ,action: req.body.action, quantity:req.body.quantity,amount: req.body.amount,totalOnItem:(req.body.quantity*req.body.amount)}],
    //                             customerId: req.body.customerId,
    //                             laundryId: req.body.laundryId
    //                         })
    //                     order.save((err, result) => {
    //                         if (err) {
    //                             console.log('err 2------------------->>', err)
    //                             Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
    //                         }
    //                         else {
    //                             console.log('result2--------------------->>', result)
    //                             Response.sendResponseWithoutData(res, responseCode.EVERYTHING_IS_OK, "Your Order No" +result.orderNo +"is placed successfully.")
    //                         }
    //                     })
    //                 }
    //             })
    //         }
    //     },



    //====================gdghghdfgdjsghadfsgdhs============================================

    //  (data, callback) => {
    //     consle.log("data2=====================>>>", data)
    //     let obj = {
    //         "orderDetails.$.quantity": req.body.quantity,
    //         "orderDetails.$.action": req.body.action,
    //         "orderDetails.$.amount": req.body.amount,
    //         "orderDetails.$.total": (req.body.amount) * (req.body.quantity),
    //     }
    //     Order.update({ customerId: req.body.customerId, "orderDetails.itemId": mongoose.Types.ObjectId(req.body.itemId) }, obj, (err, result) => {
    //         if (err) {
    //             console.log("err3------------------------->>", err)
    //             callback(err)
    //         }
    //         else {
    //             console.log("result3------------------------->>", result)
    //             callback(err, result)
    //         }
    //     })
    // }
    // ,], (err, result) => {
    //     if (err) {
    //         console.log("errr4------------------>>", err)
    //         Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
    //     } else {
    //         console.log("result4------------------>>", result)
    //         Response.sendResponseWithoutData(res, responseCode.EVERYTHING_IS_OK, "Your Order is placed successfully.")
    //     }
    // })
    //     }
    // },

    //=======================================================View Order details Summary during place order================================================
    'OrderDetails1': (req, res) => {
        validators.checkValue(req.body, { customerId: "required" }, (matched) => {
            if (matched == false) {
                Response.sendResponseWithoutData(res, responseCode.NOT_FOUND, "Please provide customerId")
                console.log('validators ==================>>', matched)
            }
            else {
                // var id = req.body._id; // any one among id or orderNo
                var customerId = req.body.customerId
                Order.aggregate([
                    { $unwind: "$orderDetails" },
                    {
                        $group: {
                            //  _id: '$id',         // any one among id or orderNo
                            _id: '$customerId',

                            quantity: { $sum: '$orderDetails.quantity' },
                            price: { $sum: '$orderDetails.price' }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            orderNo: 1,
                            quantity: 1,
                            price: 1,
                            createdAt: 1
                        }
                    }
                ]).exec((err, result) => {
                    if (err) {
                        console.log("errr4------------------>>", err)
                        Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                    }
                    else {
                        console.log("aggregate result-------------------------->>", result)
                        var order = ({
                            totalAmount: result.totalAmount
                        })
                        Order.findOneAndUpdate({ _id: req.body._id, orderNo: req.body.orderNo }, { $set: { totalAmount: result.totalAmount } }, { new: true }, (err_, result_) => {
                            if (err_) {
                                console.log("errr4------------------>>", err)
                                Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                            }
                            else {
                                console.log("updated result4------------------>>", result_)
                                Response.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, "Order details found successfully.", result_)
                            }
                        })
                    }
                })
            }
        })
    },

    //================================================= Customer Orders (can be cancel) My orders================================================================

    'customerOrders': (req, res) => {
        console.log(`request for customer order history ----->> ${req.body}`)
        if (!req.body)
            Response.sendResponseWithoutData(res, responseCode.WENT_WRONG, "Fill the details.")
        else {
            let options = {
                page: req.body.pageNumber||1,
                limit: 10,
                sort: { createdAt: -1 },
                //select: { orderDetails: 1, createdAt: 1, orderNo: 1 },
                // $sum: '$orderDetails.price' 
            }
            Order.paginate({ customerId: req.body.customerId, status: "ACTIVE"}, options, (err, result) => {
                console.log("error result --->>", err)
                if (err) {
                    Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                }
                else {
                    console.log("====>>", JSON.stringify(result))
                    Response.sendResponseWithPagination(res, responseCode.EVERYTHING_IS_OK, "Customer's orders list found successfully.", result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
                }
            })
        }
    },

    //==================================================== Show particular order details(can be cancel) ===========================================================
    'viewParticularOrderDetails': (req, res) => {
        console.log(`request for view particular order details========>>${req.body}`)
        if (!req.body._id)
            Response.sendResponseWithoutData(res, responseCode.WENT_WRONG, "Provide the _id.")
        else {
            Order.findById({ _id: req.body._id, status: "ACTIVE", deliveryStatus: "Pending" }, (err, result) => {
                console.log(`view particular order details=============>>${err, result}`)
                if (err)
                    Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                else
                    Response.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, "Particular Customer's Order history found successfully.", result)
            })
        }
    },

    //======================================================Cancel Particular Order(can be cancel) =====================================================
    'cancelParticularOrder': (req, res) => {
        console.log(`request for cancel particular order ${req.body}`)
        if (!req.body._id)
            Response.sendResponseWithoutData(res, responseCode.WENT_WRONG, "Provide the _id.")
        else {
            Order.findOne({ _id: req.body._id, status: "ACTIVE"},(err_,result_)=>{
                if(err_)
                Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                else if(!result_)
                Response.sendResponseWithoutData(res, responseCode.NOT_FOUND, "No order found.")
                else{
                    var temp = result_.createdAT // 1:30 pm
                 //   console.log(" created at timeStamp in db >>>>>", temp)
                     var presentTime = new Date().getTime() + 10800000    /// 4:30 pm
                     var presentTimeStamp = presentTime
                    console.log(" created at timeStamp at present for compare >>>>>",temp, presentTimeStamp)
                    if (temp >= presentTimeStamp) {
                    console.log("if condition>>>>")
                    return Response.sendResponseWithoutData(res, responseCode.EVERYTHING_IS_OK, " Order can be cancel within 3 hr...........Validity expired.")
                    }
                    else{
                        Order.findOneAndUpdate({ _id: req.body._id, status: "ACTIVE", deliveryStatus: "Pending" }, { $set: { status: "CANCELLED" } }, { new: true }, (err, result) => {
                            console.log(`view particular order details=============>>${err, result}`)
                            if (err)
                                Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                            else
                                Response.sendResponseWithoutData(res, responseCode.EVERYTHING_IS_OK, "Your Order No. " + result.orderNo + " is cancelled successfully.")
                        })
                    }
                }
            }) 
        }
    },

    //================================================place order according to async======================================================

    // 'placeOrder': (req, res) => {
    //     console.log(`request for place order========>>${req.body}`)
    //     if (!req.body)
    //         Response.sendResponseWithoutData(res, responseCode.WENT_WRONG, "Fill the details.")
    //     else {
    //         waterfall([
    //             function (callback) {
    //                 Order.count({}, (err, result) => {
    //                     if (err) {
    //                         console.log('err 1------------------->>', err)
    //                         callback(err)
    //                     }
    //                     else {
    //                         var orderNo;
    //                         if (result == 0 ? orderNo = 1000 : orderNo = result + 1000)
    //                             req.body.orderNo = orderNo
    //                         var obj = {
    //                             orderNo: req.body.orderNo,
    //                             deliveryType: req.body.deliveryType,
    //                             customerId: req.body.customerId
    //                         }
    //                         var order = new Order(obj)
    //                         order.save(obj, (err, result) => {
    //                             if (err)
    //                                 callback(err)
    //                             else {
    //                                 console.log("result1---------->>", result)
    //                                 callback(null, result)
    //                             }
    //                         })
    //                     }
    //                 })
    //             }, function (data, callback) {
    //                 console.log("data=2 for same action===================>>", data._id)
    //                 let obj
    //                 if (req.body.sameAction == true) {
    //                     obj = {
    //                         $push: {
    //                             orderDetails: {
    //                                 itemId: req.body.itemId,
    //                                 action: req.body.action,
    //                                 price: req.body.price,
    //                                 quantity: req.body.quantity,
    //                             }
    //                         }
    //                     };
    //                 }
    //                 else {
    //                     obj = {
    //                         $push: {
    //                             orderDetails: {
    //                                 itemId: req.body.itemId,
    //                                 quantity: req.body.quantity,
    //                                 price: req.body.price,
    //                                 sameAction: req.body.sameAction,
    //                                 differentAction: [{ clothType: req.body.clothType, action: req.body.action, description: req.body.description }]
    //                             }
    //                         }
    //                     };
    //                 }
    //                 console.log("obj--------------->>", obj)
    //                 Order.findByIdAndUpdate({ _id: data._id }, obj, { new: true }).populate({ path: 'orderDetails.itemId', select: 'itemPrice' }).exec((err, result) => {
    //                     console.log("err result2------------->>", err, result)
    //                     if (err)
    //                         callback(err)
    //                     else {
    //                         callback('', result)
    //                     }
    //                 })
    //             },], (err, result) => {
    //                 console.log("err==========>> result=================>>", err, result)
    //                 if (err) {
    //                     Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
    //                 } else
    //                     Response.sendResponseWithoutData(res, responseCode.EVERYTHING_IS_OK, "Your order No. " + result.orderNo + " is placed successfully.")
    //             })
    //     }
    // },

    //===============================================================Place Order (according)=======================================

    'placeOrder': (req, res) => {
        console.log(`request for place order========>>${req.body}`)
        if (!req.body)
            Response.sendResponseWithoutData(res, responseCode.WENT_WRONG, "Fill the details.")
        else {
            Order.count({}, (err, result) => {
                if (err) {
                    console.log('err while generating count------------------->>', err)
                    Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                }
                else{
                    //var orderNo;
                    if(result == 0 ? req.body.orderNo = 1000 : req.body.orderNo = result + 1000)
                    // req.body.orderNo = orderNo
                    var order = new Order(req.body)
                    order.save((err, result) => {
                        console.log("err result---->>",err,result)
                        if (err)
                            Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                        else{
                            console.log("result1---------->>", result)
                            Response.sendResponseWithoutData(res, responseCode.EVERYTHING_IS_OK, "Your order No. " + result.orderNo + " is placed successfully.")
                        }
                    })
                }
            })
        }
    },




//======================================== Order Summary after placing the order ===================================================
//=====================================if they send the totalAmount  then update it through that
    'orderSummary': (req, res) => {
        console.log(`Request for order summary ${JSON.stringify(req.body)}`)
        if (!req.body)
            Response.sendResponseWithoutData(res, responseCode.WENT_WRONG, "Fill the details.")
        else {
            // let options = {
            //     page: req.params.pageNumber,
            //     limit: 10,
            //     sort:{createdAt:-1}
            // }
            // Order.findById({ _id: req.body._id, status: "ACTIVE" }).populate({ path: 'orderDetails.itemId', select: 'itemPrice' }).exec((err, result) => {
            Order.findById({ _id: req.body._id, status: "ACTIVE" }, { orderDetails: 1, createdAt: 1, orderNo: 1 }).exec((err, result) => {
                console.log("err result--->>", err, result)
                if (err)
                    Response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                else {
                    Response.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, "Your order No. " + result.orderNo + " summary found successfully.", result)
                }
            })
        }
    },
    //===================================== Add Delivery Address during order placement ====================================================
    "addDeliveryAddress": (req, res) => {
        console.log("req for deliver address is " + JSON.stringify(req.body))
        if (!req.body)
            Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please fill all required data.")
        else {
            let obj = {
                $push: {
                    deliveryAddresses: {
                        "unitNo": req.body.deliveryAddress.unitNo,
                        "areaName": req.body.deliveryAddress.areaName,
                        "houseNo": req.body.deliveryAddress.houseNo,
                        "streetNo": req.body.deliveryAddress.streetNo,
                        "poBox": req.body.deliveryAddress.poBox,
                        "location.coordinate": req.body.deliveryAddress.coordinate,
                        "addressType": req.body.deliveryAddress.addressType
                    }
                }
            };
            User.findByIdAndUpdate({ _id: req.body._id }, obj, { new: true }, (error, result) => {
                if (error)
                    Response.sendResponseWithoutData(res, responseCode.WENT_WRONG, responseMessage.INTERNAL_SERVER_ERROR)
                else if (!result)
                    Response.sendResponseWithData(res, responseCode.NOT_FOUND, responseMessage.NOT_FOUND, result)
                else
                    Response.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, "Delivery address added successfully.", result)
            })
        }
    },

    //=========================== module exports ==================================================
}
module.exports = orderApis;