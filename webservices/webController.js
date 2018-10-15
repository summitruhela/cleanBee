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

const webApis = {

  /* ====================================== All Laundry Api section(for website also) ====================================== */
  laundrySignUp: (req, res) => {
    if (!req.body.phoneNumber || !req.body.password ) {
        return func.responseHandler(res, 401, "Parameters missing.")
    }
    var obj = new Laundry({
        laundryName: req.body.laundryName,
        firstName: req.body.firstName,
        phoneNumber: req.body.phoneNumber,
        lastName: req.body.lastName,
       // type: req.body.type,
      //  adminName: req.body.adminName,
        // coordinates:req.body.coordinates,
        // addresses:[{
        //     unitNumber:req.body.addresses.unitNumber,
        //     areaName:req.body.addresses.areaName,
        //     houseNumber:req.body.addresses.houseNumber,
        //     streetNumber:req.body.addresses.streetNumber,
        //     poBoxNumber:req.body.addresses.poBoxNumber
        // }]
    })
    Laundry.findOne({
        phoneNumber: req.body.phoneNumber
    }, (err, result) => {
        if (err) {
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
        } else if (result) {
            Response.sendResponseWithoutData(res,404, "Laundry is alredy Exist.")
           // return func.responseHandler(res, 404, "Laundry is alredy Exist.")
        } else {
            func.bcrypt(req.body.password, (err1, bcrPassword) => {
                if (err1) {
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                } else {
                    obj.password = bcrPassword
                    obj.save((err, result) => {
                        if (err) {
                            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                        } else {
                            Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Laundry signup successfully.",result);
                        }
                    })
                }
            })
        }
    })
},

//............................................verify otp..........................................................

verifyOtp: (req, res) => {
    if (!req.body.phone) {
        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, 'Parameter missing.')
    }
    // check user exist or not in database and also check otp of user .............
    User.findOneAndUpdate({
        phone: req.body.phone,
        otp: req.body.otp,
    }, {
        $set: {
            otpVerified: true,
            status: "ACTIVE"
        }
    }, (err_, result) => {
        if (err_) {
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
        } else if (!result) {
            Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Invalid OTP");
        } else {
            Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "OTP verified.");
        }
    })
},

//  Resend OTP/forgot password screen ..........................................................
resendOtp: (req, res) => {
    if (!req.body.phone) {
        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, 'Parameter missing.')
    }
    User.findOne({
        phone: req.body.phone,status:"ACTIVE"   //matching phone number Exist ot not .....................
    }, (err, result) => {
        if (err) {
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
        } else if (!result) {
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, "Invalid Credentials.")
        } else {
            // generate random number and send otp on mobile
          //  var random = Math.floor(100000 + Math.random() * 900000)
            var otp = message.getOTP();
            func.sendMessageNexmo(result.phone, otp, (errOtp, otpresult) => {
                if (errOtp) {
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                } else {
                    // change the otp in database......................
                    User.findOneAndUpdate({
                        phone: req.body.phone
                    }, {
                        $set: {
                            otp: random
                        }
                    }, (err, result) => {
                        if (err) {
                            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                        } else {
                            console.log("result========>>", result)
                            Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "OTP send successfully to mobile no.");
                        }
                    })
                }
            })
        }
    })
},

//....................login..................................................................

logIn: (req, res) => {
    console.log("req.body ====>>", req.body)
    if (!req.body.phoneNumber) {
        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
    }
    // create object to generate the JWt..............
    var objJWT = {
        // email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber
    }
    Laundry.findOne({
        phoneNumber: req.body.phoneNumber,status:"ACTIVE"//check User exist or not ............
    }).lean().exec((err, result) => {
        if (err) {
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
        } else if (!result) {
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, "Invalid Credentials.")
        } else {
            console.log("result password ===>>", result)
            // bcrypt the password....................
            func.bcryptVerify(req.body.password, result.password, (err1, result1) => {
                console.log(" result 1====>>", err1, result1)
                if (err1) {
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                } else if (result1 == false) {
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, "Invalid Credentials.")
                } else {
                    // create JWT ...........
                    func.jwt(objJWT, (err2, jwtToken) => {
                        if (err2) {
                            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                        } else {
                            // insert one extra key JWt for give in front....................
                            result['jwt'] = jwtToken
                            Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "You are successfully logged In.");
                        }
                    })
                }
            })
        }
    })
},

//...................logout....................................................................................


'logout': (req, res) => {
    Laundry.update({ _id: req.body._id }, { $set: { jwtToken: '', deviceToken: '' } }, { new: true }, (error, result) => {
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
            User.findOneAndUpdate({ phoneNumber: req.body.phoneNumber, status: "ACTIVE" }, { $set: { password: hash } }, (error, result) => {
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

//................set laundry profile..........................................................

'setlaundryProfile':(req,res)=>{
    console.log("req for set laundry profile",req.body)
    if(!req.body._id)
        Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please give id.")
    else{
        cloudinary.uploadImage(req.body.laundryImage, (err, result) => {
            // imageArray[imageArray.length] = result
            if (err)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
            else {
                console.log("cloudinary upload image",result.laundryImage)
                var obj={
                    laundryImage:result.laundryImage,
                    addresses:[{
                    unitNumber:req.body.addresses.unitNumber,
                    areaName:req.body.addresses.areaName,
                    houseNumber:req.body.addresses.houseNumber,
                    streetNumber:req.body.addresses.streetNumber,
                    poBoxNumber:req.body.addresses.poBoxNumber
                    }]
                } 
                Laundry.findByIdAndUpdate({_id:req.body._id,status:"ACTIVE"},{$set:obj},{new:true},(err,result)=>{
                    if(err)
                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
                    else
                        Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Laundry profile updated successfully.")
                })
            }
        })
       
    }
},

//....................get laundry profile................................................

'getLaundryProfile':(req,res)=>{
    if(!req.params._id)
        Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please give id.")
    else{
        Laundry.findOne({_id:req.params._id,status:"ACTIVE"},(err,result)=>{
            if(err)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
            else
                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Laundry profile found successfully.",result)
        })
    }
},

//...................change password..................................................................


"changePassword": (req, res) => {
    if (!req.body.oldPassword && !req.body._id && !req.body.newPassword)
        return Response.sendResponseWithData(res, resCode.BAD_REQUEST, "Please provide all required data.");
    else {
        console.log("Change password request " + JSON.stringify(req.body))
        Laundry.findById({ _id: req.body._id, status: "ACTIVE" }, (err, success) => {
            console.log("err result 1-------------->>>", err, success)
            if (err) {
                console.log("Data of change pass>>>>>>>>>>>>>>", err)
                return Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR);
            }
            if (!success)
                return Response.sendResponseWithData(res, resCode.NOT_FOUND, "LAUNDRY NOT EXIST");
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

//..........................Add item in laundry>>>>>>>>>>>>>.web.....................................................
'addItem':(req,res)=>{
    if(!req.body.laundryId||!req.body.itemName||!req.body.price)
    return Response.sendResponseWithData(res, resCode.BAD_REQUEST, "Please provide all required data.");
    else{
        Laundry.findByIdAndUpdate({_id:req.body.laundryId,status:"ACTIVE"},{$push:{laundryItems:{ itemName:req.body.itemName,price:req.body.price }} },{new:true},(err,result)=>{
            if(err)
                return Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR);
            else{
                Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Item added successfully."); 
            }
        })
    }
},

//...........................................item list----laundry(in progress)..............................................

// 'ItemList':(req,res)=>{
//     if(!req.body.laundryId)
//     return Response.sendResponseWithData(res, resCode.BAD_REQUEST, "Please provide all required data.");
//     else{
//         // let options = {
//         //     page: req.body.page||1,
//         //     limit: 10,
//         //     sort: { createdAt: -1 },
//         //    select: { 'laundryItems': 1 }
//         // }
//         // if(!req.body.search){
//         //     var query
//         // }
//         Laundry.find({ status: "ACTIVE", _id:req.body.laundryId}, options, (err, result) => {
//             if (err)
//                 Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
//             else if (result.length == 0)
//                 Response.sendResponseWithData(res, resCode.NOT_FOUND, "No data found.")
//             else
//                 Response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, "Laundry found successfully.", result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
//         })
//     }

// }



//.................................... module export ............................................................

}
module.exports = webApis;





   
