const jwt = require('jsonwebtoken');

//const app = require('express')();
const config = require('../config/config')();
const Response = require('../common_functions/response_handler');
const resCode = require('../helper/httpResponseCode')
const resMessage = require('../helper/httpResponseMessage');
const User = require('../models/userModel');
 
const auth = { 
   "auth_func": (req, res, next)=>{
        var token =  req.headers.token || req.body.token || req.query.token ;
        //console.log("header"+req.headers._id+"  token is "+token)
         var userId = req.headers._id;           
        if(token){
            //console.log("secret key is "+config.secret_key)
            jwt.verify(token, config.secret_key, (err,decoded)=>{
                if(err)
                {
                    console.log("token not verified",err)
                    Response.sendResponseWithoutData(res, resCode.UNAUTHORIZED, "Authentication failed.",err)
                }    
                else{
                    console.log("token verified")
                        User.findOne({_id:userId,status:"ACTIVE"},(error, result)=>{
                            console.log("result of user "+ JSON.stringify(result))
                            if(error)
                                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
                            else if(result==null){
                                console.log("null user entered")
                                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "User not found.")
                            }
                            else{
                                req.decoded = decoded;
                                if(result.jwt == token){
                                    next();
                                }else{
                                    Response.sendResponseWithoutData(res, resCode.UNAUTHORIZED,"Invalid token.")
                                }
                            }                        
                        })
                    }
                })
        }else{
            Response.sendResponseWithoutData(res, 403, "No token provided.")
        }

    }
};

module.exports = auth;