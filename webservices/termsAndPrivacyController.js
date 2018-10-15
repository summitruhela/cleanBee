const StaticContent = require('../models/termsAndPrivacyModel');
const Response = require('../common_functions/response_handler');
const resCode = require('../helper/httpResponseCode');
const resMessage = require('../helper/httpResponseMessage');

const staticApi = {
     // 'saveStatic': (req, res) => {
    //     if(!req.body)
    //         Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please give all required data.")
    //     else{
    //         static = new StaticContent(req.body);
    //         static.save((error, result)=>{
    //             if(error)
    //                 Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
    //             else    
    //                 Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, req.body.termsAndConditions?"Terms and Conditions saved successfully.":"Privacy policy saved successfully.");
    //         })
    //     }
    // },
//==============================================================UPDATE STATIC ================================================================
    'updateStatic': (req, res) => {
        if(!req.body)
            Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please give all required data.")
        else{
            StaticContent.findByIdAndUpdate({_id:req.body._id},{$set:{
                "termsAndConditions":req.body.termsAndConditions,
                "privacyPolicy": req.body.privacyPolicy,
                "aboutUs": req.body.aboutUs,

            }},{new:true},
            (error,result)=>{
                if(error)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
                else if(!result)
                    Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "This id does not exist.")
                else 
                    Response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, "Your Content updated successfully.")
            })
        }
    },
    'getStaticContent': (req, res) => {
        StaticContent.find((error,result)=>{
            if(error)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            else if(result.length==0)
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, 'No staic content found.')
            else
                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Static content found successfully.", result);
        })
    },
    'getTutorials': (req, res) => {
        StaticContent.find({},(error,result)=>{
            if(error)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            else if(result.length==0)
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, 'No tutorials found.')
            else
                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Tutorials found successfully.", result[0].tutorial);
        })
    },
    'getSupport':(req,res)=>{
        console.log("qwtyuiop")
        StaticContent.find({},{call:1,mail:1,whatsApp:1},(error,result)=>{
            console.log(error,result)
            if(error)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            else if(result.length==0)
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, 'No tutorials found.')
            else
                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Support content found successfully.", result);
        }) 
    },
    'getService':(req,res)=>{
        StaticContent.find({},{QuickService:1,RegularService:1},(error,result)=>{
            if(error)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            else if(result.length==0)
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, 'No service found.')
            else
                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Service content found successfully.", result);
        }) 
    },

    'getHomeService':(req,res)=>{
        StaticContent.find({},{HomePageOffer:1},(error,result)=>{
            if(error)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            else if(result.length==0)
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, 'No Offer-Service found.')
            else
                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Offer-Service content found successfully.", result);
        }) 
    },
    'whyUs':(req,res)=>{
        StaticContent.find({},{whyUs:1},(error,result)=>{
            if(error)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            else if(result.length==0)
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, 'No Why Us found.')
            else
                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Why Us content found successfully.", result);
        }) 
    },
    'howItWork':(req,res)=>{
        StaticContent.find({},{howItWork:1},(error,result)=>{
            if(error)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
            else if(result.length==0)
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, 'No how It Work found.')
            else
                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "how It Work content found successfully.", result);
        }) 
    },
}

module.exports = staticApi;