const keyPublishable = 'pk_test_TfxRGGRlj5ei0V55cYpLmLmK';
const keySecret = 'sk_test_8UJFwi9hMfZfForAtFiMfCXe';
//sk_live_eu5Ok9PfOo4mQZk5pu9sNRKZ
const stripe = require("stripe")(keySecret);
const response = require('../common_functions/response_handler');
const responseCode = require('../helper/httpResponseCode');
const responseMessage = require('../helper/httpResponseMessage');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const async = require('async');

const paymentApis = {
    //==============================================Payment via Stripe========================
    pay: (req, res) => {
        //modeOfPayment:req.body.modeOfPayment
        if (!req.body._id || !req.body.email||!req.body.modeOfPayment) {
            response.sendResponseWithoutData(res, responseCode.PARAMETER_MISSING, responseMessage.PARAMETER_MISSING)
        }
        console.log(`Req for payment is ${JSON.stringify(req.body)}`)
        if(req.body.modeOfDelivery=="ViaCard"){
            stripe.customers.create({
                email: req.body.email,
                source: req.body.stripeToken,
            }).then((customer) => {
                return stripe.charges.create({
                    amount: req.body.amount,
                    currency: "usd",
                    customer: customer.id
                })
                console.log("customer=====>", customer)
            }).then((charge) => {
                if (!charge) {
                    console.log("Cannot charge a customer that has no active card", charge)
                } {
                    console.log("charge is------------------>>", charge)
                    Order.count({}, (errCount, resultCount) => {
                        if (errCount)
                            console.log("errCount==>", errCount)
                        else {
                            console.log("resultCount==<", resultCount)
                            resultCount = resultCount + 5000
                            var obj = {
                                orderNo: resultCount,
                                transactionHash: charge.balance_transaction,
                                modeOfPayment:req.body.modeOfPayment,
                                totalAmount: req.body.amount,
                                customerId: req.body._id,
                                laundryId: req.body.laundryId,
                                modeOfDelivery: req.body.modeOfDelivery,
                                deliveryCharges: req.body.deliveryCharge,
                                orderItem: req.body.orderItem,
                                deliveryAddress: {
                                    unitNo: req.body.deliveryAddress.unitNo,
                                    areaName: req.body.deliveryAddress.areaName,
                                    houseNumber: req.body.deliveryAddress.houseNumber,
                                    streetNumber: req.body.deliveryAddress.streetNumber,
                                    poBox: req.body.deliveryAddress.poBox
                                },
                                pickUpAddress: {
                                    unitNo: req.body.pickUpAddress.unitNo,
                                    areaName: req.body.pickUpAddress.areaName,
                                    houseNumber: req.body.pickUpAddress.houseNumber,
                                    streetNumber: req.body.pickUpAddress.streetNumber,
                                    poBox: req.body.pickUpAddress.poBox
                                }
                            }
                            new Order(obj).save((err, result) => {
                                if (err) {
                                    response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                                } else {
                                    // response.sendResponseWithoutData(res, responseCode.EVERYTHING_IS_OK, "Success.")
                                    response.sendResponseWithoutData(res, responseCode.EVERYTHING_IS_OK, 'Payment done successfully.')
                                }
                            })
                        }
                    })
                }
            }).catch(err => {
                console.log("err in catch =====", err)
                response.sendResponseWithoutData(res, responseCode.WENT_WRONG, responseMessage.INTERNAL_SERVER_ERROR)
            })

        }
        else{
            Order.count({}, (errCount, resultCount) => {
                if (errCount)
                    console.log("errCount==>", errCount)
                else {
                    console.log("resultCount==<", resultCount)
                    resultCount = resultCount + 5000
                    var obj = {
                        orderNo: resultCount,
                        modeOfPayment:req.body.modeOfPayment,
                        totalAmount: req.body.amount,
                        customerId: req.body._id,
                        laundryId: req.body.laundryId,
                        modeOfDelivery: req.body.modeOfDelivery,
                        deliveryCharges: req.body.deliveryCharge,
                        orderItem: req.body.orderItem,
                        deliveryAddress: {
                            unitNo: req.body.deliveryAddress.unitNo,
                            areaName: req.body.deliveryAddress.areaName,
                            houseNumber: req.body.deliveryAddress.houseNumber,
                            streetNumber: req.body.deliveryAddress.streetNumber,
                            poBox: req.body.deliveryAddress.poBox
                        },
                        pickUpAddress: {
                            unitNo: req.body.pickUpAddress.unitNo,
                            areaName: req.body.pickUpAddress.areaName,
                            houseNumber: req.body.pickUpAddress.houseNumber,
                            streetNumber: req.body.pickUpAddress.streetNumber,
                            poBox: req.body.pickUpAddress.poBox
                        }
                    }
                    new Order(obj).save((err, result) => {
                        if (err) {
                            response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR)
                        } else {
                            // response.sendResponseWithoutData(res, responseCode.EVERYTHING_IS_OK, "Success.")
                            response.sendResponseWithoutData(res, responseCode.EVERYTHING_IS_OK, 'Payment done successfully.')
                        }
                    })
                }
            }) 
        }
       
    },
    // "orderItem":[
    //     {"noOfItems":3,"itemName":"Shirt","action":"dryClean",”price”:””},
    //     {"noOfItems":5,"itemName":"pent","action":"dryClean",price”:””},
    // {"noOfItems":5,"itemName":"pent",price”:””,[{"type":"yellow shirt","action":"dryClean"},{"type":"yellow shirt","action":"dryClean"}]},
    // ],
    // orderDetails: [{ itemId:{type: Schema.Types.ObjectId,ref:'Item'},action:{type: String},quantity:{type: Number},price:{type:Number},
    // sameAction:{type:Boolean},differentAction:[{clothType:{type:String},description:{type:String},action:{type:String}}] }],
    //========================================================= Update Payment Mode ==================================================

    'paymentMode': (req, res) => {
        if (!req.body)
            response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, "Please provide all the details.")
        else {
            Order.findByIdAndUpdate({
                _id: req.body._id,
                status: "ACTIVE"
            }, {
                $set: {
                    modeOfPayment: req.body.modeOfPayment
                }
            }, {
                "fields": {
                    modeOfPayment: 1,
                    totalAmount: 1,
                    deliveryCharge: 1
                },
                new: true
            }, (err, result) => {
                console.log("result--->>", result)
                if (err)
                    response.sendResponseWithoutData(res, responseCode.WENT_WRONG, responseMessage.INTERNAL_SERVER_ERROR)
                else {
                    console.log("payment---->>", result.totalAmount, result.deliveryCharge, +result.totalAmount + +result.deliveryCharge)
                    response.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, 'Payment mode updated Successfully.', result)
                }
            })
        }
    },

    //====================================================== Update Payment Status ======================================================

    'paymentStatusUpdate': (req, res) => {
        if (!req.body._id)
            response.sendResponseWithoutData(res, responseCode.INTERNAL_SERVER_ERROR, "Please provide the _id")
        else {
            Order.findByIdAndUpdate({
                _id: req.body._id,
                status: "ACTIVE",
                paymentStatus: "Pending"
            }, {
                $set: {
                    paymentStatus: "Recieved"
                }
            }, {
                new: true
            }, (err, result) => {
                if (err)
                    response.sendResponseWithoutData(res, responseCode.WENT_WRONG, responseMessage.INTERNAL_SERVER_ERROR)
                else {
                    response.sendResponseWithoutData(res, responseCode.EVERYTHING_IS_OK, 'Payment status updated Successfully.')
                }
            })
        }
    }

    //================================================================Module exports =====================================================================
}
module.exports = paymentApis;