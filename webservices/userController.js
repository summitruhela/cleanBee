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
const common = require('../common_functions/message')
var func = require('./function.js')

const userApis = {
    //================================================== Image Upload Api ================================================================================================//
    'imageUpload': (req, res) => {
        console.log("req is " + JSON.stringify(req.body))
        var imageArray = [], counter = 0;
        each(req.body.imageUrl, (item, next) => {
            counter++;
            cloudinary.uploadImage(item, (err, result) => {
                imageArray[imageArray.length] = result
                if (err)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
                else if (req.body.imageUrl.length == counter) {
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Image uploaded successfully.", imageArray);
                } else {
                    next();
                }
            })
        }, (finalResult) => {
            console.log(finalResult)
        })
    },
    //============================================================= Register in app =====================================================================================//
    'register': function (req, res) {
        var token
        if (!req.body.firstName || !req.body.lastName) {
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, 'Please provide the user firstname/lastname.');
        }
        else if (!req.body.phone) {
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, 'Provide the phoneNmuber.');
        } else if (!req.body.password) {
            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, 'Provide the password.');
        } else {
            waterfall([
                function (callback) {
                    User.findOne({ phone: req.body.phone }).exec(function (err_, result) {
                        if (err_) {
                            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                        } else if (result) {
                            Response.sendResponseWithoutData(res, resCode.ALREADY_EXIST, "Phone Number Already Exist.")
                        }
                        else {
                            callback(null, result);
                        }
                    })
                },
                function (data, callback) {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                            req.body.password = hash
                            var otp = message.getOTP();
                            req.body.otp = otp

                            var value = new User(req.body)
                            common.sendMessage("Your otp code is " + otp, req.body.phone, (err, result) => {
                                console.log(err || result);
                            })
                            value.save(function (err, result_) {
                                if (err) {
                                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                                } else {
                                    message.sendMessage(req.body.phone, otp)
                                    callback(null, result_)
                                }
                            })
                        })
                    })
                }
            ], (err, result) => {
                if (err) {
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                } else {
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "User signUp successfully.", result)
                }
            })
        }
    },
    //==================================================== complete Signup ============================================================================================//
    'completeSignup': function (req, res) {
        if (req.body.userId) {
            if (!req.body.profilePic) {
                var update = req.body
                var value = req.body.address
                delete update['address'];
                if (req.body.email) {
                    delete update['email'];
                }
                User.findByIdAndUpdate(req.body.userId, { $set: update, $push: { address: { $each: value } } }, { new: true }, function (err_, result) {
                    console.log("dsghgdsgdsghsd", err_, result)
                    if (err_) {
                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                    } else {
                        Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "User signUp successfully.", result)
                    }
                })
            } else {
                var update = req.body
                var value = req.body.address
                delete update['address'];
                var base64 = req.body.profilePic
                imageUpload.uploadImage(base64, function (err, imageUrl) {
                    req.body.profilePic = imageUrl
                    var update = req.body
                    User.findByIdAndUpdate({ _id: req.body.userId }, { $set: update, $push: { address: value } }, { new: true }, function (err, data) {
                        if (err) {
                            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                        } else {
                            Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "User signUp successfully.")
                        }
                    })
                })
            }
        }
    },
    //================================================== Login Api ===========================================================================================//
    'login': (req, res) => {
        console.log("login request------------", req.body)
        if (!req.body)
            Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Email or phone required.");
        else {
            var objJWT = {
                phone: req.body.phone,
                email: req.body.email,
                password: req.body.password
            }
            if(req.body.email){
                var query={email: req.body.email,status: "ACTIVE" }
            }
            else if(req.body.phone){
                var query={phone: req.body.phone,status: "ACTIVE" }
            }
            // var query = { $or: [{ $and: [{ email: req.body.email }, { status: "ACTIVE" }] }, { $and: [{ phone: req.body.phone }, { status: "ACTIVE" }] }] }
            console.log("query-------------->"+JSON.stringify(query))
            User.findOne(query)
                .exec((error, result1) => {
                    console.log("err result@@@@@@@@@@@@@@@@@@@@@@@@------>>" + error, result1.password)
                    if (error)
                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG);
                    else if (!result1) {
                        Response.sendResponseWithoutData(res, resCode.UNAUTHORIZED, resMessage.NOT_MATCH);
                    }
                    else if (result1.otpVerified == false) {
                        return res.send({ responseCode: 401, responseMessage: "User is not verified.", result1 });
                    }
                    else {
                        var token = jwt.sign({ _id: result1._id, email: result1.email, password: result1.password }, config.secret_key);
                        // func.jwt(objJWT, (err2, jwtToken) => {
                        // if (err2) {
                        //     return func.responseHandler(res, 400, "Internal Server Error.")
                        // } else {
                        // insert one extra key JWt for give in front....................
                        User.findOneAndUpdate(query, { $set: { jwt: token, deviceToken: req.body.deviceToken, deviceType: req.body.deviceType } }, { new: true }, (err, result) => {
                           // console.log("errr=============", err, result)
                            if (err)
                                return func.responseHandler(res, 400, "Internal Server Error.")
                            else {
                                //   value = result
                                console.log("**********************", JSON.stringify(result.password))
                                bcrypt.compare(req.body.password, result.password, (err1, res1) => {
                                    //  bcrypt.compare(req.body.password, result.password, (err, res1) => {
                                    console.log("result----->>", err1, res1)
                                    if (res1) {
                                        Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.LOGIN_SUCCESS, result)
                                    }
                                    else
                                        Response.sendResponseWithData(res, 404, "Incorrect password.",res1)
                                })
                            }

                        })
                        //result['jwt'] = jwtToken

                        // return func.responseHandler(res, 200, "Success.", result)
                    }
                })
        }
        //       })
        //     }
        // }
    },
    //================================================== Send link or OTP to users Api ===========================================================================================//
    'resendOTP': (req, res) => {
        validators.checkValue(req.body, { userId: 'required' }, (matched) => {
            if (matched == false) {
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "Please provide all details")
            }
            else {
                let otp1 = message.getOTP();
                User.findOneAndUpdate({ _id: req.body.userId, status: "ACTIVE", }, { $set: { otp: otp1 } }, { new: true }, (error, result) => {
                    if (error)
                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG);
                    else if (!result)
                        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "UserId not found.")
                    else {
                        message.sendMessage("OTP", "Your otp is" + result.otp, result.phone, (err, res1) => {
                            if (err) {
                                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "Please enter correct phone no.")
                            }
                            else {
                                console.log("otp send" + JSON.stringify(res1));
                                Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "OTP send successfully to your mobile.")
                            }
                        })
                    }
                })
            }
        })
    },
    //================================================== Match OTP Api for app =======================================================================================================//
    "verifyOTP": (req, res) => {
        User.findOne({ _id: req.body.userId }).lean().exec((error, result) => {
            if (error)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
            else if (!result)
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "user not Found.")
            else
                if (result.otp == req.body.otp) {
                    User.findOneAndUpdate({ _id: result._id }, { $set: { otpVerified: true } }, (err, data) => {
                        if (err) {
                            return Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                        } else {
                            return Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "OTP matched successfully.")
                        }
                    })
                } else {
                    return Response.sendResponseWithoutData(res, resCode.UNVERIFIED, "Incorrect Otp.")
                }
        })
    },
    //================================================== Reset Password Api ===========================================================================================//
    "resetPassword": (req, res) => {
        validators.checkValue(req.body, { userId: 'required', password: 'required', confirmPassword: 'required' }, (matched) => {
            if (matched == false) {
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "Please give userId & password.")
            }
            else {
                waterfall([
                    function (callback) {
                        let saltRounds = 10;
                        bcrypt.genSalt(saltRounds, (err, salt) => {
                            bcrypt.hash(req.body.password, salt, (error, hash) => {
                                if (error)
                                    callback(error)
                                else {
                                    console.log("hash------------->>", hash)
                                    callback(null, hash)
                                }
                            })
                        })
                    },
                    function (hash, callback) {
                        console.log("forgot password hash " + hash)
                        User.findOneAndUpdate({ _id: req.body.userId, status: "ACTIVE" }, { $set: { password: hash } }, (error, result) => {
                            if (error)
                                callback(error)
                            else
                                callback(null, result)
                        })
                    }
                ], (error, result) => {
                    if (error) {
                        return Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
                    }
                    else if (!result)
                        return Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "User not found.")
                    else
                        return Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Password updated successfully.")
                })
            }
        })
    },
    //==========================================forgot password ==================================================================================================//
    'forgotPassword': function (req, res) {
        console.log("Forgot password request " + JSON.stringify(req.body))
        if (!req.body.phone) {
            Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "Please give phone.")
        }
        else {
            User.findOne({ phone: req.body.phone }, (err, result) => {
                if (result != null) {
                    var otp = message.getOTP();
                    common.sendMessage("Forgot Password OTP is " + otp, req.body.phone, (err, result) => {
                        console.log("OTP SENT");
                    })
                    User.findByIdAndUpdate(result._id, { $set: { otp: otp } }, (err, result) => {
                        if (!err)
                            return res.send({ responseCode: 200, responseMessage: "OTP sent successfully." })
                        else
                            return res.send({ responseCode: 500, responseMessage: resMessage.WENT_WRONG })
                    })
                }
                else {
                    return res.send({ responseCode: 404, responseMessage: "NOT FOUND" });
                }
            })
        }
    },
    //============================================================== LOGOUT API =====================================================================================//
    'logOut': (req, res) => {
        console.log("req for logout is " + JSON.stringify(req.body))
        validators.checkValue(req.body, { _id: 'required' }, (matched) => {
            if (matched == false) {
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "Please provide all details")
                console.log('data==================>>', matched)
            }
            else {
                User.findByIdAndUpdate({ _id: req.body._id }, { $set: { token: '', deviceToken: '' } }, { new: true }, (error, result) => { //remove token...
                    if (error) {
                        console.log("error of logout " + JSON.stringify(error))
                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                    } else if (!result) {
                        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                    }
                    else {
                        console.log("result of logout " + JSON.stringify(result))
                        Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "User logged out successfully !")
                    }
                })
            }
        })
    },
    //========================================== My profile ===========================================================================================================//
    'getProfile': (req, res) => {
        console.log("req for view profile " + JSON.stringify(req.body))
        if (!req.body)
            Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "User id is required.")
        else {
            User.findById({ _id: mongoose.Types.ObjectId(req.body.userId) }, (err, result) => {
                console.log("err result--->,", err, result)
                if (err)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                else {
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "User Profile found successfully.", result)
                }
            })
        }
    },
    //============================================= Add address ======================================================================================================//
    "addAddress": (req, res) => {
        console.log("req for  address is " + JSON.stringify(req.body))
        if (!req.body)
            Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please fill all required data.")
        else {
            let obj = {
                $push: {
                    address: {
                        "country": req.body.address.country,
                        "state": req.body.address.state,
                        "city": req.body.address.city,
                        "unitNo": req.body.address.unitNo,
                        "areaName": req.body.address.areaName,
                        "houseNo": req.body.address.houseNo,
                        "streetNo": req.body.address.streetNo,
                        "poBox": req.body.address.poBox
                    }
                }
            };
            User.findByIdAndUpdate({ _id: req.body._id }, obj, { new: true }, (error, result) => {
                console.log("errr---------------",error, result)
                if (error)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                else {
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Address added successfully.", result)
                }
            })
        }
    },
    //============================================= Edit profile ======================================================================================================//
    'editProfile': function (req, res) {
        if (req.body._id) {
            if (!req.body.profilePic) {
                var update = {
                    $set: {
                        firstName: req.body.firstName, lastName: req.body.lastName,
                        dob: req.body.Dob, gender: req.body.gender, email: req.body.email
                    }
                }
                User.findOne({ _id: req.body._id, status: { $ne: 'DELETE' } }, (err, result1) => {
                    if (err)
                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                    else if (result1.email != req.body.email){
                        User.findOne({email:req.body.email},(err,result)=>{
                            if(err)
                            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                            else{
                                if(result){
                                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, "Already Exist.")
                              }
                              else{
                                User.findByIdAndUpdate({ _id: req.body._id }, update, { new: true }, function (err_, result) {
                                    if (err_) {
                                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                                    } else {
                                        Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Profile successfully updated.", result)
                                    }
                                })
                              }
                            }
                        })

                    }
                    else {
                        User.findByIdAndUpdate({ _id: req.body._id }, update, { new: true }, function (err_, result) {
                            if (err_) {
                                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                            } else {
                                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Profile successfully updated.", result)
                            }
                        })
                    }
                })

            } else {

                var base64 = req.body.profilePic
                imageUpload.uploadImage(base64, function (err, imageUrl) {
                    req.body.profilePic = imageUrl
                var update = {
                    $set: {
                        firstName: req.body.firstName, lastName: req.body.lastName,
                        dob: req.body.Dob, gender: req.body.gender,profilePic: req.body.profilePic, email: req.body.email
                    }
                }
                User.findOne({ _id: req.body._id, status: { $ne: 'DELETE' } }, (err, result1) => {
                    if (err)
                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                    else if (result1.email != req.body.email){
                        User.findOne({email:req.body.email},(err,result)=>{
                            if(err)
                            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                            else{
                                if(result){
                                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, "Already Exist.")
                              }
                              else{
                                User.findByIdAndUpdate({ _id: req.body._id }, update, { new: true }, function (err_, result) {
                                    if (err_) {
                                        Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                                    } else {
                                        Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Profile successfully updated.", result)
                                    }
                                })
                              }
                            }
                        })
                    }
                    else {
                        User.findByIdAndUpdate({ _id: req.body._id }, update, { new: true }, function (err_, result) {
                            if (err_) {
                                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                            } else {
                                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Profile successfully updated.", result)
                            }
                        })
                    }
                })
            })

        }
    }
},
    //====================================================== Edit Address ==============================================================================================//
    'editAddress': (req, res) => {
        console.log("req for edit address====>>", JSON.stringify(req.body))
        User.update({ "address._id": req.body.addressId }, {
            $set: {
                "address.$.unitNo": req.body.address.unitNo,
                "address.$.areaName": req.body.address.areaName,
                "address.$.houseNo": req.body.address.houseNo,
                "address.$.streetNo": req.body.address.streetNo,
                "address.$.poBox": req.body.address.poBox
            }
        }, { new: true }, (error, result) => {
            if (error) {
                console.log("error " + JSON.stringify(error))
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            }
            else if (!result)
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "This address id does not exist.")
            else
                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Address updated successfully.", result)
        })
    },
    //========================================================= Delete Address =============================================================================================//
    "deleteAddress": (req, res) => {
        console.log("req for deleting  address " + JSON.stringify(req.body))
        if (!req.body)
            Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please give id of the address")
        else {
            User.findByIdAndUpdate({ _id: req.body._id }, { $pull: { address: { "_id": req.body.addressId } } }, (error, result) => {
                if (error)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                else if (!result)
                    Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "This address does not exit")
                else
                    Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Address deleted successfully.")
            })
        }
    },

    //===============================get all address========================================================================

    'getUserAddress': (req, res) => {
        console.log("req for deleting  address " + JSON.stringify(req.body))
        if (!req.body._id)
            Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please give id of the address")
        else {
            let n = req.body.page || 1
            let m = req.body.limit || 10
            User.findById({ _id: req.body._id, status: "ACTIVE" }, { address: 1 }).exec((error, result) => {
                if (error)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                // else if (!result)
                //     Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "This address does not exit")
                else {
                    console.log('result--->' + JSON.stringify(result))
                    //    var show = result.slice((n - 1) * m, n * m)
                    // let addressList = {
                    //     addressList: show,
                    //     page: n,
                    //     total: result.length,
                    //     limit: m,
                    //     pages: Math.ceil(result.length / m)
                    // }
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Address deleted successfully.", result)
                }
            })
        }

    },
    //======================================================= change Password =============================================================================================//
    "changePassword": function (req, res) {
        if (!req.body.userId || !req.body.newPassword || !req.body.password) {
            Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please fill all required data.")
        } else {
            User.findOne({ _id: req.body.userId, status: "ACTIVE" }, function (err, data) {
                if (err) {
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                } else if (!data) {
                    Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "User not found.")
                } else {
                    bcrypt.compare(req.body.password, data.password, (err, res1) => {
                        if (!res1)
                            Response.sendResponseWithoutData(res, resCode.UNVERIFIED, "Old password not matched.")
                        else {
                            bcrypt.genSalt(10, function (err, salt) {
                                bcrypt.hash(req.body.newPassword, salt, function (err, hash) {
                                    req.body.newPassword = hash;
                                    data.password = req.body.newPassword;
                                    data.save(function (err, result) {
                                        if (err) {
                                            Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                                        } else {
                                            Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Password changed successfully.")
                                        }
                                    })
                                })
                            })
                        }
                    })
                }
            })
        }
    }
    //==================================================================MODULE EXPORTS==========================================================================================// 
};
module.exports = userApis;