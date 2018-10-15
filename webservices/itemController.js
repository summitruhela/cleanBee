const User = require('../models/userModel');
const Response = require('../common_functions/response_handler');
const imageUpload = require('../common_functions/uploadImage');
const resCode = require('../helper/httpResponseCode');
const resMessage = require('../helper/httpResponseMessage');
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

const itemApis = {

//=======================================add item to laundry=======================================================
'addItem':(req,res)=>{
    console.log(`Request for add item ===>> ${JSON.stringify(req.body)}`)
    if(!req.body)
    return Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please enter required field")
    else{
         var item = new Item(req.body)
         item.save((err,result)=>{
             console.log("err result------------>>",err,result)
             if(err)
                return Response.sendResponseWithoutData(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
            else{
                return Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Items added successfully to the laundry.");
            }
         })
    }
}

//=============================================module exports=============================================================
}
module.exports = itemApis;