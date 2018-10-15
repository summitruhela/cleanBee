const v = require('node-input-validator');
const Response = require('../common_functions/response_handler');
const resCode = require('../helper/httpResponseCode')
const resMessage = require('../helper/httpResponseMessage');

const validators = { 

checkValue:(value,v2,callback)=>{
 let validator = new v(value,v2)
     validator.check().then(function (matched) {
        console.log("******************",matched)
        callback(matched);
        // if(matched==false)
        // return Response.sendResponseWithData(res, 403, "Please provide the details",matched)
        // return matched;
    });
},

};
module.exports = validators;