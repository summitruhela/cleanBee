const User = require('../models/userModel');
const Response = require('../common_functions/response_handler');
const imageUpload = require('../common_functions/uploadImage');
const resCode = require('../helper/httpResponseCode');
const resMessage = require('../helper/httpResponseMessage');
const message = require('../common_functions/message');
const bcrypt = require('bcryptjs');
const waterfall = require('async-waterfall');
const jwt = require('jsonwebtoken');
const config = require('../config/config')();
const each = require('async-each-series');
const cloudinary = require('../common_functions/uploadImage');
const async = require('async');
const mongoose = require('mongoose')
const validators = require('../middleware/validators')
var Laundry = require('../models/laundryModel');
var Order = require('../models/orderModel');
const StaticContent = require('../models/termsAndPrivacyModel');
var func = require('./function.js')

const adminApis = {

    //.................................admin login ........................................................................
    'login': (req, res) => {
        console.log('request for login===>>', req.body)
        User.findOne({ email: req.body.email }).lean().exec((error, result) => {
            console.log("result---->>", error, result)
            if (error)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG);
            else if (!result) {
                Response.sendResponseWithoutData(res, resCode.UNAUTHORIZED, resMessage.NOT_MATCH);
            }
            else {
                console.log("---------------------------------", req.body.password, result.password)
                bcrypt.compare(req.body.password, result.password, (err, res1) => {
                    console.log("res1----------------->>", res1)
                    if (err)
                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG);
                    else if (res1) {
                        console.log("result is " + JSON.stringify(result.jwtToken))
                        if (!res1.jwtToken) {
                            console.log("secret key is " + config.secret_key)
                            //generate token===================
                            var token = jwt.sign({ _id: result._id, email: result.email, password: result.password }, config.secret_key);
                            User.findOneAndUpdate({ email: req.body.email }, { $set: { jwtToken: token } }, { new: true }, (err1, res2) => {
                                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, 'You Logged In Successfully', result, token)
                            })
                        }
                        // Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Admin successfully logged in.")
                    }
                    else
                        Response.sendResponseWithoutData(res, resCode.UNAUTHORIZED, "Incorrect password.")
                })
            }
        })
    },

    //...............................................send link for forgot password......................................................................
    'sendLink': (req, res) => {
        console.log("req.body.email",req.body.email)
        User.findOne({
            email: req.body.email//'admin@coinxes.com'//req.body.email
        }, (error, result) => {
            console.log(error,result)
            if (error)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG);
            else if (!result)
                Response.sendResponseWithoutData(res, resCode.UNAUTHORIZED, 'No data found.');
            else {
                func.sendEmail(req.body.email, "Your reset password link", "Here is link to reset the password....Click here !!! :- http://172.16.6.204:8000/resetPassword/" + result._id, (err1, res1) => {
                    console.log("errr--------..", err1,res1)
                    if (err1)
                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, 'Enter correct email id.');
                    else
                        Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, 'Link successfully send to your mail.')
                })
            }
        })
    },

    //...................................................forgot password--->> reset the password.............................................................................

    "resetPassword": (req, res) => {
        console.log("reset password request " + JSON.stringify(req.body))
        if (!req.body)
            Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please give id and password.")
        waterfall([
            function (callback) {
                let saltRounds = 10;
                bcrypt.genSalt(saltRounds, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, (error, hash) => {
                        if (error)
                            callback(error)
                        else
                            callback(null, hash)
                    })
                })
            },
            function (hash, callback) {
                console.log("forgot password hash " + hash)
                User.findOneAndUpdate({ email: req.body.email, status: "ACTIVE" }, { $set: { password: hash } }, (error, result) => {
                    if (error)
                        callback(error)
                    else if (!result)
                        callback(null, result)
                    else
                        callback(null, result)
                })
            }
        ], (error, result) => {
            if (error) {
                console.log("error is " + JSON.stringify(error))
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
            }
            else if (!result)
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "User not found.")
            else
                Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Password updated successfully.")
        })
    },

    //.................................................. change password for admin......................................................................

    "changePassword": (req, res) => {
        if (!req.body.oldPassword && !req.body._id && !req.body.newPassword)
            return Response.sendResponseWithData(res, resCode.BAD_REQUEST, "Please provide all required data.");
        else {
            console.log("Change password request " + JSON.stringify(req.body))
            User.findById({ _id: req.body._id, status: "ACTIVE" }, (err, success) => {
                console.log("err result 1-------------->>>", err, success)
                if (err) {
                    console.log("Data of change pass>>>>>>>>>>>>>>", err)
                    return Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR);
                }
                if (!success)
                    return Response.sendResponseWithData(res, resCode.NOT_FOUND, "USER NOT EXIST");
                {
                    console.log("match===========>>", req.body.oldPassword, "=====================>>", success.password)
                    bcrypt.compare(req.body.oldPassword, success.password, (err, result) => {
                        console.log("err>>>>>>", err, "result of change>>>>", result);
                        if (result) {
                            let salt = bcrypt.genSaltSync(10);
                            success.password = bcrypt.hashSync(req.body.newPassword, salt)
                            User.findByIdAndUpdate({ _id: req.body._id }, { $set: { password: success.password } }, { new: true }, (err, success) => {
                                if (err) {
                                    return Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR);
                                } else {
                                    Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Password updated successfully.");
                                }
                            })
                        } else {
                            return Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, resMessage.INTERNAL_SERVER_ERROR);
                        }
                    })
                }
            })
        }
    },

    //..................................get admin profile...................................................................

    'getAdminProfile': (req, res) => {
        console.log('get admin prodile', req.body)
        if (!req.body._id)
            return Response.sendResponseWithData(res, resCode.BAD_REQUEST, "Please provide all required data.");
        else {
            console.log("Change password request " + JSON.stringify(req.body))
            User.findById({ _id: req.body._id, status: "ACTIVE" }, (err, success) => {
                console.log("err result 1-------------->>>", err, success)
                if (err) {
                    console.log("Data of change pass>>>>>>>>>>>>>>", err)
                    return Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR);
                }
                if (!success)
                    return Response.sendResponseWithData(res, resCode.NOT_FOUND, "USER NOT EXIST");
                else
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Admin details found successfully.", success);
            })
        }
    },

    //................................................logout ................................................

    'logout': (req, res) => {
        User.update({ _id: req.headers._id }, { $set: { jwtToken: '', deviceToken: '' } }, { new: true }, (error, result) => {
            if (error) {
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            } else if (!result) {
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
            }
            else {
                Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Admin logged out successfully.")
            }
        })
    },

    //........................................edit admin profile ...................................................

    'editAdminProfile': (req, res) => {
        if (!req.body._id)
            return Response.sendResponseWithData(res, resCode.BAD_REQUEST, "Please provide _id.");
        else {
            var obj = req.body
            User.findByIdAndUpdate({ _id: req.body._id, status: "ACTIVE" }, { $set: { obj } }, { new: true }, (err, result) => {
                if (err)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                else
                    Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Admin profile updated successfully.")
            })
        }
    },

    //.............................................Block/Unblock/Delete Laundry.........................................

    'updatelaundryStatus': (req, res) => {
        if (!req.body)
            return Response.sendResponseWithData(res, resCode.BAD_REQUEST, "Please provide all deails.");
        else {
            Laundry.findByIdAndUpdate({ _id: req.body._id, status: "ACTIVE" }, { $set: { status: req.body.status } }, { new: true }, (err, result) => {
                if (err)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                else
                    Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Now, your laundry is  " + req.body.status)
            })
        }
    },

    //.........................................list of accept order + search by orderno...................................................

    'acceptOrderList': (req, res) => {
        let options = {
            page: req.body.page || 1,
            limit: 10,
            sort: { createdAt: -1 },
           // populate:[{path:customerId,select:'firstName lastName'}]
        }
        var fromDate = req.body.fromDate
        var toDate = req.body.toDate
        if (req.body.search && !req.body.fromDate && !req.body.toDate) {
            console.log("in search filter")
            var query = {
                $and: [{ orderNo: { $regex: req.body.search, $options: 'i' } }, { status: "ACTIVE" }]
            }
        }
        else if (req.body.fromDate && req.body.toDate && !req.body.search) {
            console.log("in search filter")
            var query = {
                $and: [{
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                },
                {
                    status: "ACTIVE"
                }]
            }
        }
        else if (req.body.fromDate && req.body.toDate && req.body.search) {
            console.log("in search filter")
            var query = {
                $and: [{
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                },
                {
                    orderNo: {
                        $regex: req.body.search, $options: 'i'
                    }
                },
                {
                    status: "ACTIVE"
                }]
            }
        }
        else {
            var query = {
                status: "ACTIVE"
            }
        }
        Order.paginate(query, options, (err, result) => {
            if (err) {
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            } else if (result.length == 0) {
                Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "No data found.")
            } else {
                Response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, "Accept Order list found successfully.", result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
            }
        })
    },


    //.........................................open order list + search .........................................................................

    'openOrderList': (req, res) => {
        let options = {
            page: req.body.page || 1,
            limit: 10,
            sort: { createdAt: -1 },
            populate:[{path:'customerId',select:'firstName lastName'}]
        }
        var fromDate = req.body.fromDate
        var toDate = req.body.toDate
        if (req.body.search && !req.body.fromDate && !req.body.toDate) {
            console.log("in search filter")
            var query = {
                $and: [{
                    orderNo: {
                        $regex: req.body.search, $options: 'i'
                    }
                },
                { deliveryStatus: "Pending" },
                {
                    status: "ACTIVE"
                }]
            }
        }
        else if (req.body.fromDate && req.body.toDate && !req.body.search) {
            console.log("in search filter")
            var query = {
                $and: [{
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                },
                { deliveryStatus: "Pending" },
                {
                    status: "ACTIVE"
                }]
            }
        }
        else if (req.body.fromDate && req.body.toDate && req.body.search) {
            console.log("in search filter")
            var query = {
                $and: [{
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                },
                {
                    orderNo: {
                        $regex: req.body.search, $options: 'i'
                    }
                },
                { deliveryStatus: "Pending" },
                {
                    status: "ACTIVE"
                }]
            }
        }
        else {
            var query = {
                deliveryStatus: "Pending",
                status: "ACTIVE"
            }
        }
        Order.paginate(query, options, (err, result) => {
            console.log("err--------------------",err,result)
            if (err) {
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            } else if (result.length == 0) {
                Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "No data found.")
            } else {
                Response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, "Open Order list found successfully.", result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
            }
        })
    },

    //.....................................................close order list + search ................................................................

    'closeOrderList': (req, res) => {
        let options = {
            page: req.body.page || 1,
            limit: 10,
            sort: { createdAt: -1 },
          //  populate:[{path:customerId,select:'firstName lastName'}]
        }
        var fromDate = req.body.fromDate
        var toDate = req.body.toDate
        if (req.body.search && !req.body.fromDate && !req.body.toDate) {
            console.log("in search filter")
            var query = {
                $and: [{
                    orderNo: {
                        $regex: req.body.search, $options: 'i'
                    }
                },
                { deliveryStatus: "Delivered" },
                {
                    status: "ACTIVE"
                }]
            }
        }
        else if (req.body.fromDate && req.body.toDate && !req.body.search) {
            console.log("in search filter")
            var query = {
                $and: [{
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                },
                { deliveryStatus: "Delivered" },
                {
                    status: "ACTIVE"
                }]
            }
        }
        else if (req.body.fromDate && req.body.toDate && req.body.search) {
            console.log("in search filter")
            var query = {
                $and: [{
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                },
                {
                    orderNo: {
                        $regex: req.body.search, $options: 'i'
                    }
                },
                { deliveryStatus: "Delivered" },
                {
                    status: "ACTIVE"
                }]
            }
        }
        else {
            var query = {
                deliveryStatus: "Delivered",
                status: "ACTIVE"
            }
        }
        Order.paginate(query, options, (err, result) => {
            if (err) {
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            } else if (result.length == 0) {
                Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "No data found.")
            } else {
                Response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, "Close Order list found successfully.", result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
            }
        })
    },

    //.......................................get particular order details...........................................................
    'orderDetails': (req, res) => {
        if (req.body._id)
            return Response.sendResponseWithData(res, resCode.BAD_REQUEST, "Please provide _id.");
        else {
            Order.findById({ _id: req.body._id, status: "ACTIVE" }, (err, result) => {
                if (err)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                else
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Order details found successfully.", result)
            })
        }
    },

    //==============================================================UPDATE STATIC ================================================================
    'updateStatic': (req, res) => {
        if (!req.body)
            Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please give all required data.")
        else {
            if(req.body.termsAndConditions){
              
                var obj1={
                    "termsAndConditions": req.body.termsAndConditions,
                    updatedBy:req.body._id
            }
        }
            else if(req.body.privacyPolicy){
               
                var obj1={ "privacyPolicy": req.body.privacyPolicy,
                updatedBy:req.body._id
            }
            }
            else{
               
                var obj1={   "aboutUs": req.body.aboutUs,
                updatedBy:req.body._id
            }
            }
            console.log("obj1",obj1)
            StaticContent.findOneAndUpdate({status:"ACTIVE"}, {
                $set:obj1
            }, { new: true },
                (error, result) => {
                    if (error)
                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                    else if (!result)
                        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "This id does not exist.")
                    else
                        Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Your Content updated successfully.")
                })
        }
    },
//..........................................get static for admin ................................................
// 'getStaticContentAdmin': (req, res) => {
//     console.log("========================>>", req.body)
   
//     StaticContent.find((error, result) => {
//         if (error)
//             Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
//         else if (result.length == 0)
//             Response.sendResponseWithoutData(res, resCode.NOT_FOUND, 'No staic content found.')
//         else { 
//                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Static content  for found successfully.", result);
//         }

//     })
// },
    //............................get static content....................................................................'

    'getStaticContent': (req, res) => {
        console.log("========================>>", req.body)
        StaticContent.find((error, result) => {
            if (error)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            else if (result.length == 0)
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, 'No staic content found.')
            else {
                console.log("******************************", result)
                if (req.body.type == "ABOUTUS")
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Static content for about us found successfully.", result[0].aboutUs);
                else if (req.body.type == "TERMS")
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Static content for privacy policy found successfully.", result[0].termsAndConditions);
                else if (req.body.type == "PRIVACY")
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Static content  for found successfully.", result[0].privacyPolicy);
                else
                    Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "INVALID REQUEST.");
            }

        })
    },

    //................................................ Add Customer ......................................................................

    'addCustomer': (req, res) => {
        // if (!req.body.adminName || !req.body.phoneNumber || !req.body.addresses || !req.body.password ||req.body._id ||!req.body.image) {
        //     return func.responseHandler(res, 401, "Parameters missing.")
        // }
        var obj = new User({
            createdBy: req.body._id,
            adminName: req.body.adminName,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phoneNumber,
            countryCode : req.body.countryCode,
           // profilePic:result.image,
            type: "CUSTOMER",
            // address: [{
            //     unitNo: req.body.unitNo,
            //     areaName: req.body.areaName,
            //     houseNo: req.body.houseNo,
            //     streetNo: req.body.streetNo,
            //     poBox: req.body.poBox
            // }]
        })
        User.findOne({
            phone: req.body.phoneNumber
        }, (err, result) => {
            console.log("===>>>>", err, result)
            if (err) {
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            } else if (result) {
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, "Already exists.");
            } else {
                func.bcrypt(req.body.password, (err1, bcrPassword) => {
                    if (err1) {
                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                    } else {
                        console.log("bcrypt Password ====>>>", bcrPassword)

                        func.imageUploadToCloudinary(req.body.image, (errImage, resultImage) => {
                            console.log("========>>>", errImage, resultImage)
                            if (errImage) {
                                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                            } else {
                                obj['profilePic'] = resultImage
                                obj['password'] = bcrPassword
                                obj.save((err2, result2) => {
                                    if (err2) {
                                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                                    } else {
                                        message.sendMessage("Your password is" + req.body.password, req.body.phoneNumber, (err1, res1) => {
                                            console.log("errr--------..", err1)
                                            // if (err1)
                                            //     Response.sendResponseWithoutData(res, resCode.WENT_WRONG, 'Enter correct phoneNo');
                                            // else
                                            Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Customer created successfully",result2._id);
                                        })
                                        //  Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK,"Customer created successfully" );
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    },

    //........................................ Customer List ..............................................................

    'customerList': (req, res) => {
        console.log("search request body  " + JSON.stringify(req.body))
        let options = {
            page: req.body.pageNumber || 1,
            limit: 10,
            lean: true,
            password: 0,
            sort: { createdAt: -1 }
            
            
           // sort:createdAt
        }
        if (req.body.pattern.split(' ').length > 1) {//      let search = new RegExp("^" + req.body.search)  'like.pharmacyName':{ $regex: search, $options: 'i' }
            let fname = req.body.pattern.split(' ')[0], lname = req.body.pattern.split(' ')[1];//new RegExp('^' + query, 'i');
            User.paginate({
                $and: [{ $and: [{ firstName: { $regex: "^" + fname, $options: 'i' } }, { lastName: { $regex: "^" + lname, $options: 'i' } }] }, { type: "CUSTOMER" }, {
                    status: {
                        $ne: "DELETE"
                    }
                }]
            }, options, (error, result) => {
                if (error)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG);
                //else if(result.docs.length==0)
                //Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                else {
                    result.docs.map(x => delete x['password'])
                    console.log("result is", result)
                    Response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_DONE, result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
                }
            })
        }
        else if (req.body.pattern == "") {
            User.paginate({
                $and: [{ type: "CUSTOMER" }, {
                    status: {
                        $ne: "DELETE"
                    }
                }]
            }, options, (error, result) => {
                if (error)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG);
                //else if(result.docs.length==0)
                //Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                else {
                    result.docs.map(x => delete x['password'])
                    console.log("result is", result)
                    Response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_DONE, result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
                }
            })

        }
        else {

            User.paginate({
                $and: [{ $or: [{ firstName: { $regex: "^" + req.body.pattern, $options: 'i' } }, { lastName: { $regex: "^" + req.body.pattern, $options: 'i' } }] }, { type: "CUSTOMER" }, {
                    status: {
                        $ne: "DELETE"
                    }
                }]
            }, options, (error, result) => {
                if (error)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG);
                //else if(result.docs.length==0)
                //Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                else {
                    result.docs.map(x => delete x['password'])
                    console.log("result is", result)
                    Response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_DONE, result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
                }
            })
        }
    },

    //....................................... Get Particular customer Details .................................................

    'getCustomerDetail': (req, res) => {
        if (!req.params.customerId)
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, 'please  provide customer id.');
        else {
            User.findById({ _id: req.params.customerId }, { firstName: 1, lastName: 1, dob: 1, address: 1, phone: 1, gender: 1 ,profilePic:1,address:1,deliveryAddresses:1,countryCode:1}, (err, result) => {
                if (err)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG);
                else if (!result)
                    Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, 'No Customer found.')
                else
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, 'Customer found successfully.', result);
            })
        }
    },

    //..................................... Update customer status ................................................................

    'updateCustomerStatus': (req, res) => {
        if (!req.body.customerId || !req.body.status)
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, 'please  provide customer id.');
        else {
            User.findByIdAndUpdate({ _id: req.body.customerId }, { $set: { status: req.body.status } }, { new: true }, (err, result) => {

                if (err)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG);
                else if (!result)
                    Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, 'No Customer found.')
                else
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Now, customer is  " + req.body.status + " now.", result);
            })
        }
    },

    //........................................ Get particular order detail...................................................

    'getOrderDetail': (req, res) => {
        if (!req.params.orderId)
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, 'please  provide Order id.');
        else {
            Order.findById({ _id: req.params.orderId }, (err, result) => {
                if (err)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG);
                else if (!result)
                    Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, 'No Order found.')
                else
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Order detail found successfully.", result);
            })
        }
    },

    //.......................................... get laundry detail.............................................

    'getLaundryDetail': (req, res) => {
        if (!req.params.laundryId)
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, 'please  provide Laundry id.');
        else {
            Laundry.findById({ _id: req.params.laundryId }, (err, result) => {
                if (err)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG);
                else if (!result)
                    Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, 'No Laundry found.')
                else
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Laundry detail found successfully.", result);
            })
        }
    },

//......................................Edit customer ---By Admin ..............................................................
'editCustomerProfile': function (req, res) {
    if (req.body._id) {
        if (!req.body.profilePic) {
            var update = {
                $set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    countryCode:req.body.countryCode,
                    phone: req.body.phone,
                        "address.$.unitNo": req.body.addresses.unitNo,
                        "address.$.areaName": req.body.addresses.areaName,
                        "address.$.houseNo": req.body.addresses.houseNo,
                        "address.$.streetNo": req.body.addresses.streetNo,
                        "address.$.poBox": req.body.addresses.poBox
                  
                }
            }

            User.findOneAndUpdate({$and:[{ _id: req.body._id },{'address._id':req.body.addressId}]}, update, { new: true }, function (err_, result) {
                if (err_) {
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                } else {
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Profile successfully updated.", result)
                }
            })
        } else {
            var base64 = req.body.profilePic
            imageUpload.uploadImage(base64, function (err, imageUrl) {
                var update = {
                    $set: {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        phone: req.body.phone,
                        countryCode:req.body.countryCode,
                        profilePic:imageUrl,
                            "address.$.unitNo": req.body.addresses.unitNo,
                            "address.$.areaName": req.body.addresses.areaName,
                            "address.$.houseNo": req.body.addresses.houseNo,
                            "address.$.streetNo": req.body.addresses.streetNo,
                            "address.$.poBox": req.body.addresses.poBox
                      
                    }
                }
                User.findOneAndUpdate({$and:[{ _id: req.body._id },{'address._id':req.body.addressId}]}, update, { new: true }, function (err, data) {
                    if (err) {
                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                    } else {
                        Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Profile successfully updated.", data)
                    }
                })
            })
        }
    }
},
 
    //.................................... module export ............................................................

}
module.exports = adminApis;