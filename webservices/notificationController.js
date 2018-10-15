const User = require('../models/userModel');
const response = require('../common_functions/response_handler');
const resCode = require('../helper/httpResponseCode');
const resMessage = require('../helper/httpResponseMessage'); 
const noti = require('../common_functions/notification');
const Notification = require('../models/notificationModel');

const notiApi = {

//================================================= Save Token ===================================================================
    'saveToken': (req, res) => {
        if(!req.body)
            response.sendResponseWithoutData(res, resCode.SOMETHING_WENT_WRONG, resMessage.WENT_WRONG);
        else{
            User.findByIdAndUpdate({_id:req.body.userId,status:"ACTIVE"},{$set:{deviceToken:req.body.deviceToken,deviceType:req.body.deviceType}},{new:true},(error,result)=>{
                if(error)
                    response.sendResponseWithoutData(res, resCode.SOMETHING_WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR);
                else if(!result)
                    response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.NOT_FOUND)
                else
                    response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, 'Token updated successfully.')
            })
        }
    },


    // 'send_noti_to_android': (req, res) => {
    //     console.log(`User id is ${req.body._id}`)
    //     User.findOne({_id:req.body._id,status:'ACTIVE'},(error, result)=>{
    //         if(error)
    //             response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.INTERNAL_SERVER_ERROR)
    //         else if(!result)
    //             response.sendResponseWithoutData(res, resCode.WENT_WRONG, 'User not exist.')
    //         else{
    //             noti.notification(result.deviceToken,'Notification send successfully.')
    //             response.sendResponseWithoutData(res, resCode.EVERYTHING_IS_OK, 'Notification send.')
    //         }
    //     })
    // },
  
//==================================================== Notification List ===========================================================

'notificationList': (req, res) => {
    console.log(`Request for notification list ${JSON.stringify(req.body)}`)
    let options = {
        page: req.body.pageNumber,
        limit:10,
        sort: { createdAt: -1 }
    };
    Notification.paginate({"userIds.uid":req.body.userId,noti_type:'Delivery'}, options, (error, result)=>{
        if(error)
            response.sendResponseWithoutData(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
        else{
            console.log("noti list ===>",JSON.stringify(result))
            response.sendResponseWithPagination(res, resCode.EVERYTHING_IS_OK, 'Notifications list found successfully.', result.docs, { total: result.total, limit: result.limit, currentPage: result.page, totalPage: result.pages })
        }       
    })
},

//================================================= Unread Count For Notification ==========================================================

'unreadCount': (req, res) => {
        console.log(`Request for unread notification count for app ${req.params.userId}`)
        Notification.count({"userIds.uid":req.params.userId,noti_type:'Delivery',"userIds.isRead":false}, (error,result)=>{
            if(error)
                response.sendResponseWithoutData(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
            else    
                response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, 'Unread count found successfully.', result);
        })
    },

//====================================================== Update Read Status Of Notification ====================================================

    'updateReadStatus': (req, res) => {
        console.log(`Request for unread notification count --> ${req.body.userId}`)//  "deliveryAddresses.$.firstName":req.body.firstName,
        Notification.updateMany({"userIds.uid":req.body.userId,noti_type:'Delivery'},{$set:{"userIds.$.isRead":true}}, (error,result)=>{
           console.log("err and result===========>",error,result)
            if(error)
                response.sendResponseWithoutData(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
            else if(result.matchedCount == result.modifiedCount)  {
                console.log("*********************",result.matchedCount,result.modifiedCount)
                response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, 'Read status updated successfully.', 0);
            }  
            else{
                console.log(")))))))))))))))))))))))))))))))",result,"*************************",result.matchedCount,result.modifiedCount)
                response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, 'Read status updated successfully.',result.matchedCount-result.modifiedCount);
            }
        })
    },

//======================================================== Module Exports ===========================================================
}
module.exports = notiApi;