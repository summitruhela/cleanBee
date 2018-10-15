var User = require('../models/userModel');
var Laundry = require('../models/laundryModel');
var notificationModel = require('../models/notificationModel');
var func = require('./function.js')
var commonNotification = require('../common_functions/notification')
const Notification = require('../models/notificationModel');
var Order = require('../models/orderModel');
const message = require('../common_functions/message');
const mongoose = require('mongoose')
const response = require('../common_functions/response_handler');
const resCode = require('../helper/httpResponseCode');
const resMessage = require('../helper/httpResponseMessage'); 
const bcrypt = require('bcryptjs');

module.exports = {

    // User App Sign up............................................................................. 
    signUp: (req, res) => {
        if ( !req.body.password || !req.body.contact || !req.body.firstName || !req.body.lastName) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        // create jwt object for generate JWT Token for Authentication
        var objJWT = {
            // email: req.body.email,
            password: req.body.password,
            phone: req.body.contact
        }
        User.findOne({
            phone: req.body.contact,  //check user email and also active
            status: "ACTIVE"
        }, (err, result) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else if (result) {
                return func.responseHandler(res, 400, "User alredy Exist.")
            } else {
                // uplaod image of user................
             //   func.imageUploadToCloudinary(req.body.image, (errImage, resultImage) => {//
                    // if (errImage) {
                    //     return func.responseHandler(res, 400, "Internal Server Error.")
                    // } else {
                        // bcrypt the password.................
                        
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(req.body.password, salt, (err, hash) => {
                              //  req.body.password = hash
                            
                            if (err) {
                                return func.responseHandler(res, 400, "Internal Server Error.")
                            } else {
                                // generate jwt................
                                func.jwt(objJWT, (err2, jwtToken) => {
                                    if (err2) {
                                        return func.responseHandler(res, 400, "Internal Server Error.")
                                    } else {
                                        // generate random number and send to mobile...............
                                        var otp = message.getOTP();
                                        message.sendMessage("Your otp is "+ otp,req.body.contact, (errOtp, otpresult) => {
                                            // console.log("errOTP",errOtp,otpresult)
                                            // if (errOtp) {
                                            //     return func.responseHandler(res, 400, "Internal Server Error.")
                                            // } else {
                                               // console.log("=====>>>", bcrPassword)
                                                // making object to save the information..................
                                                var obj = new User({
                                                    // email: req.body.email,
                                                    password: hash,
                                                    phone: req.body.contact,
                                                    firstName: req.body.firstName,
                                                    lastName: req.body.lastName,
                                                    otp: otp,
                                                    deviceToken:req.body.deviceToken,
                                                    deviceType:req.body.deviceType,
                                                    jwt:jwtToken,
                                                   // profilePic: resultImage,
                                                    status: "ACTIVE"
                                                })
                                                obj.save((err3, result3) => {
                                                    console.log("dsgghdsghdshgsd")
                                                    if (err3) {
                                                        return func.responseHandler(res, 400, "Internal Server Error.")
                                                    } else {
                                                        result3 = result3.toObject(); //need to sending jwt in extra key to front End
                                                       // result3['jwt'] = jwtToken
                                                        // remove some keys from result............
                                                        delete result3['permissions']
                                                        delete result3['type']
                                                      //  delete result3['email']
                                                        delete result3['password']
                                                        return func.responseHandler(res, 200, "Success.", result3)
                                                    }
                                                })
                                            // }
                                        })
                                    }
                                })
                            }
                        })
            //        }
            //    })
            })
        }
    })
},
    // verify otp after sign up page ...........................................................................
    verifyOtp: (req, res) => {
        if (!req.body) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        // check user exist or not in database and also check otp of user .............
        // {$or:[{$and:[{ phone: req.body.phone
        // },{ otp: req.body.otp}]},{$and:[{ email: req.body.email
        // },{ otp: req.body.otp}]}]
        User.findOneAndUpdate({$or:[{$and:[{ phone: req.body.phone
        },{ otp: req.body.otp}]},{$and:[{ email: req.body.email
        },{ otp: req.body.otp}]}] },{
            $set: {
                otpVerified: true,
                status: "ACTIVE"
            }
        },{new:true}, (err_, result) => {
            console.log("verify otp---------->>",req.body.opt, result.otp)
            if (err_) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else if (!result) {
                return func.responseHandler(res, 401, "Invalid OTP.")
            } else {
                return func.responseHandler(res, 200, "Success.")
            }
        })
    },
    //  Resend OTP ..........if user has not not found User hit this api.........................
    resendOtp: (req, res) => {
        console.log("request---------->>",req.body)
        var random = message.getOTP();
        if (!req.body) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        else if(req.body.phone){
            User.findOne({
                phone: req.body.phone //matching phone number Exist ot not .....................
            }, (err, result) => {
                if (err) {
                    return func.responseHandler(res, 400, "Internal Server Error.")
                } else if (!result) {
                    return func.responseHandler(res, 404, "Invalid Credentials.")
                } else {
                    // generate random number and send otp on mobile
                   
                    console.log("otp generate==========>>",random)
                    //var random = Math.floor(100000 + Math.random() * 900000)
                    func.sendMessageNexmo(result.phone, random, (errOtp, otpresult) => {
                        if (errOtp) {
                            return func.responseHandler(res, 400, "internal Server Error.")
                        } else {
                            console.log('otpresult----------->>',otpresult)
                            // change the otp in database......................
                            User.findOneAndUpdate({
                                phone: req.body.phone
                            }, {
                                $set: {
                                    otp: otpresult,
                                    otpVerified:false
                                }
                            },{new:true}, (err, result1) => {
                                console.log("resend otp--------------->>",result1.otp)
                                if (err) {
                                    return func.responseHandler(res, 400, "Internal Server Error.")
                                } else {
                                    console.log("result========>>", result1)
                                    return func.responseHandler(res, 200, "Success.",result1)
                                }
                            })
    
                        }
                    })
                }
            })
        }
        else {
            User.findOne({
                email: req.body.email //matching phone number Exist ot not .....................
            }, (err, result) => {
                console.log("err1----------->sdds",err,result)
                if (err) {
                    return func.responseHandler(res, 400, "Internal Server Error.")
                } else if (!result) {
                    return func.responseHandler(res, 404, "Invalid Credentials.")
                } else {
                    // generate random number and send otp on mobile
                    var random = message.getOTP();
                    //var random = Math.floor(100000 + Math.random() * 900000)
                    func.sendEmail(result.email,"OTP","Your OTP is " +random, (errOtp, otpresult) => {
                    console.log("errr=================>>",errOtp, otpresult)
                        if (errOtp) {
                            return func.responseHandler(res, 400, "internal Server Error.")
                        } else {
                            // change the otp in database......................
                            User.findOneAndUpdate({
                                email: req.body.email
                            }, {
                                $set: {
                                    otp: random
                                }
                            },{new:true}, (err, result) => {
                                console.log("err---------------->>",err, result)
                                if (err) {
                                    return func.responseHandler(res, 400, "Internal Server Error.")
                                } else {
                                    console.log("result========>>", result)
                                    return func.responseHandler(res, 200, "Success.",result)
                                }
                            })
    
                        }
                    })
    
                }
            })

        }
       
    },
    // admin or subadmin login .....................................................................................
    logIn: (req, res) => {
        console.log("req.body ====>>", req.body)
        if (!req.body.phone) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        // create object to generate the JWt..............
        var objJWT = {
            phone: req.body.phone,
            password: req.body.password
        }
        User.findOne({
            phone: req.body.phone //check User exist or not ............
        }).lean().exec((err, result) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else if (!result) {
                return func.responseHandler(res, 404, "Invalid Credentials.")
            } else {
                User.findOneAndUpdate({ phone: req.body.phone},{$set:{deviceToken:req.body.deviceToken,deviceType:req.body.deviceType}},{new:true},(err,result)=>{
                    if (err) {
                        return func.responseHandler(res, 400, "Internal Server Error.")
                    }
                    else{
                        console.log("result password ===>>", result)
                        // bcrypt the password....................
                        func.bcryptVerify(req.body.password, result.password, (err1, result1) => {
                            console.log(" result 1====>>", err1, result1)
                            if (err1) {
                                return func.responseHandler(res, 400, "Internal Server Error.")
                            } else if (result1 == false) {
                                return func.responseHandler(res, 200, "Invalid Credentials.")
                            } else {
                                // create JWT ...........
                                func.jwt(objJWT, (err2, jwtToken) => {
                                    if (err2) {
                                        return func.responseHandler(res, 400, "Internal Server Error.")
                                    } else {
                                        // insert one extra key JWt for give in front....................
                                        result['jwt'] = jwtToken

                                        return func.responseHandler(res, 200, "Success.", result)
                                    }
                                })
        
                            }
                        })
                    }

                })
            
            }
        })
    },
    // Forgot Password api ........................................................
    forgotPassword: (req, res) => {
        if (!req.body) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        // there are two condition for checking ........user select mobile and email to reset password............
        if (req.body.email && !req.body.phone) {
            var query = {
                email: req.body.email
            }
        } else {
            var query = {
                phone: req.body.phone
            }
        }
        User.findOne(query, (err, result) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else if (!result) {
                return func.responseHandler(res, 404, "No Result Found.")
            } else {
                // generate a random number to send otp on mobile........................................
                var random = message.getOTP();
                console.log("random number is ===>>", random)
                if(req.body.phone){
                    func.sendMessageNexmo(req.body.phone, random, (errOtp, otpresult) => {
                        console.log("===>>>", errOtp, otpresult)
                        if (errOtp) {
                            return func.responseHandler(res, 400, "Internal Server Error.")
                        } else {
                            User.findOneAndUpdate({
                                phone: req.body.phone
                            }, {
                                $set: {
                                    otp: random,
                                    otpVerified:false

                                }
                            }, {
                                new: true
                            }, (err_, result_) => {
                                if (err_) {
                                    return func.responseHandler(res, 400, "Internal Server Error.")
                                } else {
                                    return func.responseHandler(res, 200, "Success.",result_)
                                }
                            })
    
                        }
                    })
                }
            else{
                func.sendEmail(result.email,"OTP","Your OTP is " +random, (errOtp, otpresult) => {
                    if (errOtp) {
                        return func.responseHandler(res, 400, "internal Server Error.")
                    } else {
                        // change the otp in database......................
                        User.findOneAndUpdate({
                            email: req.body.email
                        }, {
                            $set: {
                                otp: random,
                                otpVerified:false
                            }
                        },{new:true}, (err, result) => {
                            if (err) {
                                return func.responseHandler(res, 400, "Internal Server Error.")
                            } else {
                                console.log("result========>>", result)
                                return func.responseHandler(res, 200, "Success.",result)
                            }
                        })

                    }
                })
            }
                
            }
        })
    },
    // reset Password when Forgot and otp Match Success...............................................
    resetPassword: (req, res) => {
        if ( !req.body.password) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        // bcryypt the password .....................
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
    //    func.bcrypt(req.body.password, (errBcr, bcrPassword) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else {
                // check user exist in db ........
                User.findByIdAndUpdate({
                 _id:req.body._id
                }, {
                    $set: {
                        password: hash
                    }
                },{new:true}, (err, result) => {
                    if (err) {
                        return func.responseHandler(res, 400, "Internal Server Error.")
                    } else if (!result) {
                        return func.responseHandler(res, 200, "Invalid credentials.")
                    } else {
                        return func.responseHandler(res, 200, "Success.",result)
                    }
                })
            }
        })
//"$2a$10$v8EQmwqmu9TcWhDBFHvGCux4dRMct.EmFlb7UgDSHtxmvexhjef16"
//$2a$10$cUZ/2jkSxL1zzCm6ALibMOtDqpIaXjcO5yuwQV8pMefuI0PgJCmye
    })
},
    /* ====================================== All Laundry Api section ====================================== */
    laundrySignUp: (req, res) => {
        if (!req.body.phoneNumber || !req.body.password || !req.body.type) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        var obj = new Laundry({
            laundryname: req.body.laundryname,
            firstName: req.body.firstName,
            phoneNumber: req.body.phoneNumber,
            lastName: req.body.lastName,
            type: req.body.type,
            adminName: req.body.adminName,
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
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else if (result) {
                return func.responseHandler(res, 404, "Laundry is alredy Exist.")
            } else {
                func.bcrypt(req.body.password, (err1, bcrPassword) => {
                    if (err1) {
                        return func.responseHandler(res, 400, "Internal Server Error.")
                    } else {
                        obj.password = bcrPassword
                        obj.save((err, result) => {
                            if (err) {
                                return func.responseHandler(res, 400, "Internal Server Error.")
                            } else {
                                return func.responseHandler(res, 200, "Success.")
                            }

                        })

                    }
                })
            }
        })
    },
    //  add Laundry from admin panel ............................................................................
    AddlaundryByAdmin: (req, res) => {
        console.log("ass laundry aby admin",req.body)
        if (!req.body.phoneNumber || !req.body.laundryOwnerId || !req.body.email || !req.body.image) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        var obj = new Laundry({
            laundryName: req.body.laundryName,
            EmailAddres: req.body.email,
            phoneNumber: req.body.phoneNumber,
            coordinates: req.body.coordinates,
            countryCode:req.body.countryCode,
            Gender: req.body.gender,
            DOB:req.body.dob,
            laundryOwnerId: req.body.laundryOwnerId,
            addresses: [{
                unitNumber: req.body.addresses.unitNumber,
                areaName: req.body.addresses.areaName,
                houseNumber: req.body.addresses.houseNumber,
                streetNumber: req.body.addresses.streetNumber,
                poBoxNumber: req.body.addresses.poBoxNumber
            }]
        })
        Laundry.findOne({
            phoneNumber: req.body.phoneNumber
        }, (err, result) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else if (result) {
                return func.responseHandler(res, 404, "Laundry is alredy Exist.")
            } else {
                func.imageUploadToCloudinary(req.body.image, (errImage, resultImage) => {
                    if (errImage) {
                        return func.responseHandler(res, 400, "Internal Server Error.")
                    } else {
                        obj['laundryImage'] = resultImage
                        obj.save((err, result) => {
                            if (err) {
                                return func.responseHandler(res, 400, "Internal Server Error.",err)
                            } else {
                                return func.responseHandler(res, 200, "Success.")
                            }
                        })
                    }
                })
            }
        })
    },
    //  upadte Laundry Details
    // EditLaundryDetails:(req,res)=>{},

    /* ====================================== Admin panel api section ====================================== */
    LoginApi: (req, res) => {
        if (!req.body.Email || !req.body.password) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        User.findOne({
            email: req.body.email,

        }, (err, resut) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else if (!result) {
                return func.responseHandler(res, 404, "Invalid Credentials.")
            } else {
                func.bcryptVerify(req.body.password, resut.password, (err1, result1) => {
                    console.log("==>>>", err1, result1)
                })
            }
        })
    },
    // Show number of Laundry in Admin dashBoard...............................................
    NumberOfLaundry: (req, res) => {
        Laundry.find({}).count().exec((err, result) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else {
                return func.responseHandler(res, 200, "Success.", result)
            }
        })
    },
    // Show Number of user in Admin dashBoard...............................................
    NumberOfUsers: (req, res) => {
        User.find({}).count().exec((err, result) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else {
                return func.responseHandler(res, 200, "Success.", result)
            }
        })
    },
    // Show SubAdmin in Admin dashBoard...............................................
    NumberOfSubAdmin: (req, res) => {
        User.find({
            type: "SUBADMIN"
        }).count().exec((err, result) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else {
                return func.responseHandler(res, 200, "Success.", result)
            }
        })
    },
    getNotificationList: (req, res) => {
        console.log(`Request for notification list ${JSON.stringify(req.body)}`)
        let options = {
            page: req.body.pageNumber || 1,
            limit: 10,
            sort: {
                createdAt: -1
            }
        };
        Notification.paginate({
            userId: req.body.userId,status:"ACTIVE"
        }, options, (error, result) => {
            console.log("result------------->>",result)
            if (error)
                return func.responseHandler(res, 400, "Internal Server Error.")
            else {
                console.log("noti list ===>", JSON.stringify(result))
                response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, 'Success', result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
                // return func.responseHandler(res, 200, "Success.", result)
            }
        })
   
    },
    /* 
    get LaundryList for app & super Admin & subadmin.........................................................................................
    Create a check in front if status is [ADMIN] never gives value in subAdmin_id key...........
    if status is SUBADMIN always gives value in subAdmin_id key with value...........
    */
    getLaundryList: (req, res) => {
        let options = {
            page: req.body.page || 1,
            limit: 10,
            sort: { createdAT: -1 }
        }
        // run this section when only search filter in app.........................
        if (req.body.search && !req.body.subAdmin_id) {
            console.log("in search filter111")
            var query = {
                $and: [{
                    laundryName: {
                        $regex: new RegExp(req.body.search, "ig")
                    }
                },{
                    status:{$ne:"DELETE"}
                }]
            }
        }
        // run this section when SubAdmin get all our laundries.........................
        else if (req.body.subAdmin_id && !req.body.search) {
            console.log("in search filter2222")
            var query = {$and:[{
                createdBy: req.body.subAdmin_id,
            },{$status:"DELETE"}]}
        }
        // run this section when subadmin get data with search filter.................
        else if (req.body.subAdmin_id && req.body.search) {
            console.log("in search filter33333")
            var query = {
                $and: [{
                    createdBy: req.body.subAdmin_id,
                },{  status:{$ne:"DELETE"}}, {
                    laundryName: {
                        $regex: new RegExp(req.body.search, "ig")
                    }
                }]
            }
        }
        // run this section when user app & super admin get the laundry list..............................
        else {
            var query = {
                status:{$ne:"DELETE"}
            }
        }
       console.log("query -====>>",query)
        Laundry.paginate(query, options, (err, result) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else if (result.length == 0) {
                return func.responseHandler(res, 200, "No Result Found.")
            } else {
                response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, 'Success', result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
                // return func.responseHandler(res, 200, "Success.", result)
            }
        })
    },
    // Edit Laundry information from admin panel............................................................... 
    editLaundryDetails: (req, res) => {
        if (!req.body.admin_id || !req.body.phoneNumber || !req.body.laundryName || !req.body.email || !req.body.image || !req.body.laundry_id) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        // create a object to updating values ...............
        var obj = {
            laundryName: req.body.laundryName,
            EmailAddres: req.body.email,
            phoneNumber: req.body.phoneNumber,
            coordinates: req.body.coordinates,
            Gender: req.body.gender,
            addresses: [{
                unitNumber: req.body.addresses.unitNumber,
                areaName: req.body.addresses.areaName,
                houseNumber: req.body.addresses.houseNumber,
                streetNumber: req.body.addresses.streetNumber,
                poBoxNumber: req.body.addresses.poBoxNumber
            }]
        }

        User.findOne({
            _id: req.body.admin_id //check Admin or super admin exist or not ......................
        }, (err, result) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else if (!result) {
                return func.responseHandler(res, 404, "Invalid Credentials.")
            } else {
                // check status is blocked or deleted if status deleted or blocked ..................then subadmin has not permission to edit laudries.....
                if (result.status == "BLOCK") {
                    return func.responseHandler(res, 400, "Sorry ,You are blocked by Admin.")
                } else if (result.status == "DELETE") {
                    return func.responseHandler(res, 400, "Sorry ,You are deleted by Admin.")
                } else {
                    //  check laundry Exist or not...............
                    Laundry.findOne({
                        _id: req.body.laundry_id
                    }, (err, result) => {
                        if (err) {
                            return func.responseHandler(res, 400, "Internal Server Error.")
                        } else if (result) {
                            // check Uniques keys is not present in database ................
                            Laundry.findOne({
                                $or: [{
                                    phoneNumber: req.body.phoneNumber
                                }, {
                                    EmailAddres: req.body.email
                                }]
                            }, (err, result) => {
                                if (err) {
                                    return func.responseHandler(res, 400, "Internal Server Error.")
                                } else if (result) {
                                    return func.responseHandler(res, 404, "Laundry is already Exist.")
                                } else {
                                    // create image URl from base64 ...........
                                    func.imageUploadToCloudinary(req.body.image, (errImage, resultImage) => {
                                        if (errImage) {
                                            return func.responseHandler(res, 400, "Internal Server Error.")
                                        } else {
                                            // obj['laundryImage'] = resultImage
                                            console.log("====>>>", req.body.laundryName)
                                            Laundry.findOneAndUpdate({
                                                _id: req.body.laundry_id
                                            }, {
                                                $set: obj
                                            }, {
                                                new: true
                                            }, (err, result) => {
                                                if (err) {
                                                    return func.responseHandler(res, 400, "Internal Server Error.")
                                                } else {
                                                    return func.responseHandler(res, 200, "Success.", result)
                                                }
                                            })
                                        }
                                    })

                                }
                            })
                        } else {
                            return func.responseHandler(res, 404, "Laundry doesn't Exist.")
                        }
                    })
                }
            }
        })
    },

    // add subadmin by Super admin............................................................................
    addSubAdmin: (req, res) => {
        if (!req.body.adminName || !req.body.phoneNumber || !req.body.addresses || !req.body.password || !req.body.image || !req.body._id) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        // create a object to save information of subadmin..........................
        var obj = new User({
            createdBy: req.body._id,
            adminName: req.body.adminName,
            phone: req.body.phoneNumber,
            type: "SUBADMIN",
            //added by @sumit
            email:req.body.email,
            countryCode: req.body.countryCode,
            permissions: {
                customerMgnt: req.body.permissions.customerMgnt,
                orderMgnt: req.body.permissions.orderMgnt,
                laundryMgnt: req.body.permissions.laundryMgnt,
                staticContentMgnt: req.body.permissions.staticContentMgnt,
                dashboardMgmt: req.body.permissions.dashboardMgmt
            },
            address: [{
                unitNo: req.body.addresses.unitNumber,
                areaName: req.body.addresses.areaName,
                houseNo: req.body.addresses.houseNumber,
                streetNo: req.body.addresses.streetNumber,
                poBox: req.body.addresses.poBoxNumber
            }]
        })
        User.findOne({$or:[{
            phone: req.body.phoneNumber //check user exist or not .......................
        },{email:req.body.email}]}, (err, result) => {
            console.log("===>>>>", err, result)
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else if (result) {
                return func.responseHandler(res, 404, "SubAdmin is alredy Exist.")
            } else {
                // bcrypt the password ...........................
                func.bcrypt(req.body.password, (err1, bcrPassword) => {
                    if (err1) {
                        return func.responseHandler(res, 400, "Internal Server Error.")
                    } else {
                        console.log("bcr Password ====>>>", bcrPassword)
                        // upload image to cloudinary........................
                        func.imageUploadToCloudinary(req.body.image, (errImage, resultImage) => {
                            console.log("========>>>", errImage, resultImage)
                            if (errImage) {
                                return func.responseHandler(res, 400, "Internal Server Error.")
                            } else {
                                // add extra key in result.................
                                obj['profilePic'] = resultImage
                                obj['password'] = bcrPassword
                                obj.save((err2, result2) => {
                                    if (err2) {
                                        return func.responseHandler(res, 400, "Internal Server Error.", err2)
                                    } else {
                                        return func.responseHandler(res, 200, "Success.")
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    },

    test: (req, res) => {
        var message = {
            //registration_ids: ['dcwk4fElbTs:APA91bHyK9Ece-TZFBBpYZGpfqcYZgQcwTuhSQq7RrHDVNpHC5JjyuuhhxYIv8bB7sKmKeZt5oSRurUAJFyIuADzmMWrmmK9swfhwZMZo7VFCDx3L4Enq2Z4HJ4sWiuiFGoeN4jPydzJcbzSrEKW2bZFavZAkpeVEw'], // required fill with device token or topics
            // to:"dcwk4fElbTs:APA91bHyK9Ece-TZFBBpYZGpfqcYZgQcwTuhSQq7RrHDVNpHC5JjyuuhhxYIv8bB7sKmKeZt5oSRurUAJFyIuADzmMWrmmK9swfhwZMZo7VFCDx3L4Enq2Z4HJ4sWiuiFGoeN4jPydzJcbzSrEKW2bZFavZAkpeVEw",
            to: "APA91bFoi3lMMre9G3XzR1LrF4ZT82_15MsMdEICogXSLB8-MrdkRuRQFwNI5u8Dh0cI90ABD3BOKnxkEla8cGdisbDHl5cVIkZah5QUhSAxzx4Roa7b4xy9tvx9iNSYw-eXBYYd8k1XKf8Q_Qq1X9-x-U-Y79vdPq",
            data: {
                title: 'Clean Bee',
                body: 'testing for notification'
            },
            notification: {
                title: 'Clean Bee',
                body: 'testing for notification'
            }
        };
        func.pushNotification(message, (err, result) => {
            if (err) {
                console.log("err =====>", err)
            } else {
                var obj = {
                    userId: req.body.userId,
                    laundryId: req.body.laundryId,
                    notification: message.notification
                }
                console.log("result after=====>", result)
                new Notification(obj).save((err1, result1) => {
                    if (err1) {
                        console.log("Not saved in err =====>", err1)
                        return func.responseHandler(res, 400, "Internal Server Error.")
                    } else {
                        console.log("successfully save =====>", result1)
                        return func.responseHandler(res, 200, "Success.", result1)
                    }
                })
            }
        })
    },
    /* get Sub Admin list with paginations......................................................................
       SUBADMIN never add another subadmin ......because subadmin has not permission
    */
    getSubAdminDetail: (req, res) => {
        let options = {
            page: req.body.page || 1,
            limit: 10,
            select: 'adminName phone createdAt status email countryCode',
            sort:{createdAt:-1}
        }
        var fromDate = req.body.fromDate
        var toDate = req.body.toDate
        if (req.body.search && !req.body.fromDate && !req.body.toDate) {
            console.log("in search filter =========>>>")
            var query = {
                $and: [
                    //     {
                    //     createdBy: req.body._id
                    // },
                    {type:"SUBADMIN"} ,
                    {
                        
                        status: {
                            $ne: "DELETE"
                        }
                    }, {
                        $or: [{
                            adminName: {
                                $regex: new RegExp(req.body.search, "ig")
                            }
                        }, {
                            phone: {
                                $regex: new RegExp(req.body.search, "ig")
                            }
                        }]
                    }
                ]
            }
            //  var query =  {$and:[{createdBy:req.body.createdBy},{adminName:{$regex:new RegExp(req.body.search,"ig")}}]}
            //  var query = {$and:[{createdBy:req.body.createdBy},{phone:{$regex:new RegExp(req.body.search,"ig")}}]}                  
            //  var query = { $where: `/^${req.body.search}.*/.test(this.otp)` } //working on number when search..............
        } else if (!req.body.search && req.body.fromDate && req.body.toDate) {
            var query = {
                $and: [
                    //     {
                    //     createdBy: req.body._id
                    // }, 
                    {type:"SUBADMIN"} ,
                    {
                        createdAt: {
                            $gte: fromDate,
                            $lte: toDate
                        }
                    }
                ]
            }
        } else if (!req.body.search && !req.body.toDate && !req.body.fromDate) {
            // var query = {$and:[{createdBy: req.body._id},{$ne:{status:"DELETE"}}]}
            console.log("jewbdhjedje")
            var query = {
                $and: [
                    //     {
                    //     createdBy: req.body._id
                    // },
                    {type:"SUBADMIN"} ,
                    {
                        status: {
                            $ne: "DELETE"
                        }
                    }
                ]
            }
        } else if (req.body.search && req.body.toDate && req.body.fromDate) {
            console.log("================================in all filter")
            var query = {
                $and: [{
                    status: {
                        $ne: "DELETE"
                    }
                }, {
                    createdAt: {
                        $gte: fromDate,
                        $lte: toDate
                    }
                }, {type:"SUBADMIN"} , {
                    $or: [{
                        adminName: {
                            $regex: new RegExp(req.body.search, "ig")
                        }
                    }, {
                        phone: {
                            $regex: new RegExp(req.body.search, "ig")
                        }
                    }]
                }]
            }
        }

        // var query = {createdBy:req.body._id}
        console.log("in get subAdmin list ====>>>")
        User.paginate(query, options, (err, result) => {
            console.log("result total === .>", err, result)
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.")
            } else if (result.total == 0) {
                response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, 'Success', result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
            } else {
                console.log("successfully save =====>", result)
                response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, 'Success', result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
            }
        })
    },
    //  Update information of subadmin .........................................
    updateSubAdmin: (req, res) => {
        console.log("req for udate sub admin==============",req.body)
        if (!req.body.adminName || !req.body.addresses/*  @Sumit|| !req.body.password  */|| !req.body.image || !req.body._id || !req.body.subAdmin_id || !req.body.permissions) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }

        var obj = {
            email:req.body.email,
            adminName: req.body.adminName,
            phone: req.body.phoneNumber,
            countryCode:req.body.countryCode,
            permissions: {
                customerMgnt: req.body.permissions.customerMgnt,
                orderMgnt: req.body.permissions.orderMgnt,
                laundryMgnt: req.body.permissions.laundryMgnt,
                staticContentMgnt: req.body.permissions.staticContentMgnt,
                dashboardMgmt: req.body.permissions.dashboardMgmt
            },
            address: [{
                unitNo: req.body.addresses.unitNumber,
                areaName: req.body.addresses.areaName,
                houseNo: req.body.addresses.houseNumber,
                streetNo: req.body.addresses.streetNumber,
                poBox: req.body.addresses.poBoxNumber
            }]
        }
                User.findOne({ $or:[{ phone: req.body.phoneNumber},{ email:req.body.email}]
                   
                   // status:{$ne:"DELETE"}
                }, (err1, result) => {
                    console.log("find one------------>>",err1, result)
                    if (err1) {
                        return func.responseHandler(res, 400, "Internal Server Error.")
                    } else if (!result) {
                        return func.responseHandler(res, 404, "Sub Admin not exist.")   
                    } else {
                                func.imageUploadToCloudinary(req.body.image, (errImage, resultImage) => {
                                    console.log("========>>>", errImage, resultImage)
                                    if (errImage) {
                                        return func.responseHandler(res, 400, "Internal Server Error.")
                                    } else {
                                        if(resultImage != null){
                                            obj['profilePic'] = resultImage
                                        }
                                        User.findOneAndUpdate({
                                            _id: req.body.subAdmin_id
                                        }, {
                                            $set: obj
                                        }, {
                                            new: true
                                        }, (err2, result2) => {
                                            if (err2) {
                                                return func.responseHandler(res, 400, "Internal Server Error2.", err2)
                                            } else if (result2) {
                                                return func.responseHandler(res, 200, "Success.")
                                            } else {
                                                return func.responseHandler(res, 404, "SubAdmin Id not Exist.")
                                            }
                                        })
                                    }
                                })
                    }
        //         })
        //     }
    })//
    },
    // block/Delete subadmin by Super admin ..................................................................................................................
    blockSubadmin: (req, res) => {
        if (!req.body.subAdmin_id || !req.body.status) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        User.findOneAndUpdate({
            _id: req.body.subAdmin_id
        }, {
            $set: {
                status: req.body.status
            }
        }, {
            new: true
        }, (err, result) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error2.", err)
            } else if (!result) {
                return func.responseHandler(res, 404, "Invalid Credentials.")
            } else {
                return func.responseHandler(res, 200, "Success.", result)
            }
        })
    },
    // Block/unblock/delete the laundriers ........................................................................................ 
    blockLaundry: (req, res) => {
        if (!req.body.laundry_id || !req.body.status || !req.body.admin_id) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        User.findOne({
            _id: req.body.admin_id //find Admin or subadmin exist
        }, (err, result) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.", err)
            } else if (!result) {
                return func.responseHandler(res, 404, "Invalid Credentials.")
            } else {
                // check status of admin incase of subadmin blocked/delete  by admin 
                if (result.status == "BLOCK") {
                    return func.responseHandler(res, 400, "Sorry ,You are blocked by Admin.")
                } else if (result.status == "DELETE") {
                    return func.responseHandler(res, 400, "Sorry ,You are deleted by Admin.")
                } else {
                    // change the status of Laundry
                    Laundry.findOneAndUpdate({
                        _id: req.body.laundry_id
                    }, {
                        $set: {
                            status: req.body.status
                        }
                    },{new:true}, (err, result) => {
                        if (err) {
                            return func.responseHandler(res, 400, "Internal Server Error.", err)
                        } else if (!result) {
                            return func.responseHandler(res, 404, "Sorry Laundry doesn't Exist.")
                        } else {
                            console.log(" change status of Laundry..............................")
                            return func.responseHandler(res, 200, "Success.")
                        }
                    })
                }

            }
        })
    },
    // get user information of a single user .....................................................................
    getParticularUser: (req, res) => {
        if (!req.params._id) {
            return func.responseHandler(res, 401, "Parameters missing.")
        }
        User.findOne({
            _id: mongoose.Types.ObjectId(req.params._id)
        }, {
            otp: 0,
            otpVerified: 0,
            _id: 0,
            updatedAt: 0,
            createdAt: 0,
            createdBy: 0
        }, (err, result) => {
            if (err) {
                return func.responseHandler(res, 400, "Internal Server Error.", err)
            } else if (!result) {
                return func.responseHandler(res, 404, "User not Exist.")
            } else {
                return func.responseHandler(res, 200, "Success.", result)
            }
        })
    },

    //.........................pankaj sir api ......................................................

'completeSignup': function (req, res) {
    if (req.body.userId) {
        if (!req.body.profilePic) {
            var update = req.body
            var value = req.body.address
            delete update['address'];
            if(req.body.email){
                delete update['email'];
            }
            User.findByIdAndUpdate({ _id: req.body.userId }, { $set: update, $push: { $each:{address: value} } }, { new: true }, function (err_, result) {
                if (err_) {
                    return func.responseHandler(res, 400, "Internal Server Error.")
                } else {
                    return func.responseHandler(res,200, "User signUp successfully.", result)
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
                        return func.responseHandler(res, 400, "Internal Server Error.")
                    } else {
                        return func.responseHandler(res,200, "User signUp successfully.", result)
                    }
                })
            })
        }
    }
},
//...............................................view particular laundry detail.......................
'viewlaundryDetail':(req,res)=>{
    if(!req.body._id)
    return func.responseHandler(res, 401, "Parameters missing.")
    else{
    Laundry.findById({_id:req.body._id, status:{$ne:"DELETE"}},(err,result)=>{
        if(err)
        return func.responseHandler(res, 400, "Internal Server Error.")
        else
        return func.responseHandler(res,200, "laundry details found successfully.",result)
    })
}
},

//================================gagan notification ===================================================================
'deleteParticularNotification':(req,res)=>{
    console.log('delete particular notification'+ JSON.stringify(req.body))
    if(!req.body._id)
        return func.responseHandler(res, 401, "Parameters missing.")
    else{
        Notification.findByIdAndUpdate({_id:req.body._id,userId:req.body.userId,},{$set:{status:"DELETE"}},{new:true},(err,result)=>{
            if(err)
            return func.responseHandler(res, 400, "Internal Server Error.")
            else
            return func.responseHandler(res,200, "Notification deleted successfully.")
        })
    }
},

//............................delete all notification...........................................................

'deleteAllNotification':(req,res)=>{
    console.log('delete particular notification'+ JSON.stringify(req.body))
        Notification.update({userId:req.body.userId,},{$set:{status:"DELETE"}},{multi:true},(err,result)=>{
            if(err)
            return func.responseHandler(res, 400, "Internal Server Error.")
            else
            return func.responseHandler(res,200, "Notification deleted successfully.")
        })
}



}