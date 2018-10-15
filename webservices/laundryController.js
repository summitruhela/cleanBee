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
const laundryApis = {
    //=========================================== Search laundry ==================================================================//
    'laundryLocation': function (req, res) {
        if (!req.body._id) {
            return Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please enter required field")
        } else {
            Laundry.findById({ _id: req.body._id }).exec(function (errrrrrr, ressssult) {
                if (errrrrrr) {
                    return Response.sendResponseWithoutData(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
                } else {
                    console.log('pleae check result ', ressssult.laundryAddress.location.coordinates)
                    var query = [{
                        $geoNear: {
                            distanceField: "dist.calculated",
                            maxDistance: 0,
                            includeLocs: "dist.location",
                            spherical: true,
                        }
                    },
                    ]
                    Laundry.aggregate(query, function (err, docs) {
                        if (err) {
                            return Response.sendResponseWithoutData(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
                        } else if (!docs) {
                            Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "Laundries not found.")
                        } else {
                            return Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Laundries  found successfully", docs);
                        }
                    });
                }
            })
        }
    },
    //================================================================ search Laundry By Location =======================================================//
    // 'searchlaundry': (req, res) => {
    //     let options = {
    //         page: req.body.pageNumber,
    //         limit: 10,
    //         sort: { laundryName: -1 },
    //         select: { laundryName: 1 ,laundryImage:1,'laundryAddress.location.coordinates':1},
    //         lean: true
    //     }
    //     if (req.body.lat == "" && req.body.lng == "") {
    //         Laundry.paginate({ status: "ACTIVE" }, options, (err, result) => {
    //             if (err)
    //                 Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
    //             else if (result.docs.length == 0)
    //                 Response.sendResponseWithData(res, resCode.NOT_FOUND, "No Laundry found.")
    //             else{
    //                 var newArray = [];
    //                 result.docs.map(x => newArray.push({laundryName:x.laundryName,laundryImage:x.laundryImage,_id:x._id, coordinates: x['laundryAddress']['location']['coordinates']}));
    //                 Response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, "Laundry list found successfully.", newArray, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
    //             }
                   
    //         })
    //     }
    //     else {
    //         Laundry.paginate({ 'laundryAddress.location.coordinates': [req.body.lat, req.body.lng], status: "ACTIVE" }, options, (err, result) => {
    //             if (err)
    //                 Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
    //             else if (result.docs.length == 0)
    //                 Response.sendResponseWithData(res, resCode.NOT_FOUND, "No Laundry found.")
    //             else{
    //                 var newArray = [];
    //                 result.docs.map(x => newArray.push({laundryName:x.laundryName, _id:x._id, coordinates: x['laundryAddress']['location']['coordinates']}));
    //                 Response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, "Laundry list found successfully.", newArray, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
    //             }
    //         })
    //     }
    // },
    'searchLaundry':(req,res)=>{
        console.log('searchLaundry')
        let n = req.body.page || 1
        let m =  10
        // if (!req.body.lat && !req.body.lng)
        //     return res.send({responseCode: 500,responseMessage: 'Error 1.'})
         if(req.body.lat!=""&&req.body.lng!=""){
            var masterQuery = [
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(req.body.lng),parseFloat(req.body.lat)] },
                        key: "coordinates",
                        distanceField: "distance.calculated",
                        distanceMultiplier: 1 / 1000, // to convert the distance meter to kilo meter
                        minDistance: 0,
                        query: { status: 'ACTIVE'},
                        includeLocs: "dist.location",
                        spherical: true
                    }
                }
            ]
        Laundry.aggregate(masterQuery).exec((err, result) => {
            console.log(err || result);
            if (err)
            return res.send({responseCode: 500,responseMessage: 'Error 2.'}) 
            else
            var show = result.slice((n - 1) * m, n * m)
                    let laundryList = {
                        laundryList: show,
                        page: n,
                        total: result.length,
                        limit: m,
                        pages: Math.ceil(result.length / m)
                    }
            return res.send({responseCode: 200,responseMessage: 'Success.',data:laundryList})   
             }) 
        }
           else{
            let options = {
                page: req.body.page||1,
                limit: 10,
                sort: { createdAt: -1 },
               // select: { laundryName: 1 }
            }
            Laundry.paginate({ status: "ACTIVE" }, options, (err, result) => {
                if (err)
                    Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
                else if (result.length == 0)
                    Response.sendResponseWithData(res, resCode.NOT_FOUND, "No data found.")
                else
                   {console.log('result=34653456=========>>',result.docs)
                        Response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, "Laundry found successfully.", result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })}
            })
           }
    },
    //===================================================================Laundry Details===================================================///
    'laundryDetails': (req, res) => {
        console.log(`Request for laundry details are ${req.body}`)
        if (!req.body.laundryId)
            return Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please enter required field")
        else {
            Item.find({ laundryId: req.body.laundryId, status: "ACTIVE" }).exec((err, result) => {
                console.log('err result=========================>>', err, result)
                if (err)
                    return Response.sendResponseWithoutData(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
                else {
                    Laundry.findById({ _id: req.body.laundryId, status: "ACTIVE" }, (err_, result_) => {
                        console.log("result_=============>>>", result_)
                        if (err_)
                            return Response.sendResponseWithoutData(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
                        else {
                            var jsonObj = {};
                            var final = [];
                            final[0] = result;
                            final[1] = result_;
                            for (var i = 0 ; i < final.length; i++) {
                            jsonObj= final[i];  
                            }
                            console.log('final------------->>', final)
                            return Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Laundries details found successfully", jsonObj);
                        }
                    })
                }
            })
        }
    },
    //===================================================================addLaundry===================================================////
    'addLaundry': (req, res) => {
        console.log(`Request for add laundry ${JSON.stringify(req.body)}`)
        if (!req.body)
            return Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, "Please enter required field")
        else {
            var laundry = new Laundry(req.body)
            laundry.save((err, result) => {
                console.log("err result---------------->>", err, result)
                if (err)
                    return Response.sendResponseWithoutData(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
                else {
                    return Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, "Laundry added successfully");
                }
            })
        }
    },
    'AddlaundryByAdmin': (req, res) => {
        if (!req.body.phoneNumber || !req.body.laundryOwnerId || !req.body.email ||!req.body.image) {
            return Response.sendResponseWithData(res, 401, "Parameters missing.")
        }
        var obj = new Laundry({
            laundryName: req.body.laundryName,
            EmailAddres: req.body.email,
            phoneNumber: req.body.phoneNumber,
            coordinates: req.body.coordinates,
            Gender: req.body.gender,
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
                return Response.sendResponseWithData(res, 400, "Internal Server Error.")
            } else if (result) {
                return Response.sendResponseWithData(res, 404, "Laundry is already Exist.")
            } else {
                cloudinary.uploadImage(req.body.image,(errImage,resultImage)=>{
                    if(errImage){
                        return Response.sendResponseWithData(res, 400, "Internal Server Error.")
                    }
                    else{
                        obj['laundryImage'] = resultImage
                        obj.save((err, result) => {
                            console.log(err || result )
                            if (err) {
                                return Response.sendResponseWithData(res, 400, "Internal Server Error.")
                            } else {
                                return Response.sendResponseWithData(res, 200, "Success.")
                            }
                        })
                    }
                })
            
            }
        })
    },
    'listOflaundry': (req, res) => {
        let options = {
            page: req.body.pageNumber||1,
            limit: 10,
            sort: { createdAt: -1 },
            select: { laundryName: 1 }
        }
        Laundry.paginate({ status: "ACTIVE" }, options, (err, result) => {
            if (err)
                Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
            else if (result.length == 0)
                Response.sendResponseWithData(res, resCode.NOT_FOUND, "No data found.")
            else
                Response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, "Laundry found successfully.", result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
        })
    }
    //================================================ module exports ===================================================================== 
}
module.exports = laundryApis;
