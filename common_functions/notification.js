var FCM = require('fcm-push');
var apn = require('apn');
var Client = require('node-rest-client').Client;
const Noti = require('../models/notificationModel');
const User = require('../models/userModel'); 
const mongoose = require('mongoose');
const waterfall = require('async-waterfall');

var notifications = {

    // 'notification': (storeId,title,body) => {
    //     var deviceTokens = [], userRes = []; 
    //     waterfall([
    //         function(callback){
    //             User.find({assignStoreId:storeId, status:"ACTIVE","type":"CUSTOMER",pushNotification:true},{"deviceToken":1}, (error,result)=> {
    //                 userRes = result;
    //                 for(let i=0;i<result.length;i++){
    //                     if(result[i].deviceToken)
    //                         deviceTokens.push(result[i].deviceToken)
    //                 }
    //                 console.log(`Device tokens are ${JSON.stringify(deviceTokens)}`)
    //                 callback(null,deviceTokens)
    //             })
    //         },
    //         function(tokens,callback){
    //             var client = new Client();
    //             // idArr[0] = token;
    //             // set content-type header and data as json in args parameter
    //             var args = {
    //                 data: { 
    //                     "notification":{
    //                         "title":title,
    //                         "body":body,
    //                         "sound":"default",
    //                         "click_action":"FCM_PLUGIN_ACTIVITY",
    //                         "icon":"fcm_push_icon",
    //                         // "actions": [
    //                         //     { "icon": "emailGuests", "title": "EMAIL GUESTS", },
    //                         //     { "icon": "snooze", "title": "SNOOZE", }
    //                         // ]
    //                       },
    //                       "data":{
    //                         "param1":"blank",
    //                         "param2":"value2"
    //                       },
    //                         // "to":"ebdbZ0Zgmkc:APA91bHbHeBbT__0Oor-nZunfGBWCUw23gkBLm1FvhQ7u30dfEdEzFxKDVe71SHkt9_Y68eueGCZ7yVuGdJN_SELrJgfeYf4nz9esINvts9My8-phyFqKuFXispIuCXQq1waroXvMNP7iJz6ORYCFTNlBdp28L55Qg",
    //                         // "to":"dSIXFWKCuzo:APA91bHVD6S8aRYNWI2lMNmcnAos08nkXVqpQtJcM5kV1qtKCM3xN4w3GniPB-Yc7aILapkLNehQH91Dgg3zK8aPKe38L6hAfKJfqj_HGs5ypWz9SjUzDZIuQdhZQ0uBZ7_GUitz8GxtRcta-BZBVlQ7iIgwpzNQ1Q",
    //                         "registration_ids": tokens,
    //                         "priority":"high",
    //                         "restricted_package_name":""
    //                  },
    //                 headers: { "Content-Type": "application/json", 
    //                             "Authorization":"key=AAAAhTQQvgs:APA91bHYy14WxdIN6yAmGZJ3Utu07vukU3Yjonevmgq5-_zUeTkmgo2Aw_ldeNHJ7vLC29Iquoc1IqBQqabD_qSLDypMY3axWuHoN0N7JYMj3EbNyzmg9ApYQYDBiDiI9SZnt1JRVoWoYjV5ZVFZEOmGzMedL1Vv5A"
    //                          }
    //             };                
    //             client.post("https://fcm.googleapis.com/fcm/send", args, function (data, response) {
    //                 // parsed response body as js object
    //                 //console.log(`Object of noti ${JSON.stringify(data)}`);
    //                 let ids = [];
    //                 for(let i=0;i<userRes.length;i++){
    //                     if(userRes[i].deviceToken)
    //                         ids.push(userRes[i]._id)
    //                 }
    //                 if(data.success){
    //                     let obj = {
    //                         userIds: ids.map(x =>  {let obj={uid:x}; return obj}),
    //                         adminID:{aid:storeId},
    //                         noti_type: 'Offer', 
    //                         content: body
    //                     };
    //                     let noti  = new Noti(obj);
    //                     noti.save((er1,ress)=>{
    //                         console.log(`Error is ${JSON.stringify(er1)}   result is ${JSON.stringify(ress)}`)
    //                         callback(null,data);
    //                         //response.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, 'Order has been placed successfully and confirmation code send to your mobile number.',result)
    //                     })
    //                 }else{
    //                     callback(null,data)
    //                     console.log(`Object of noti ${JSON.stringify(data)}`);
    //                 }
    //                 // raw response
    //                 //console.log(response);
    //             });
    //         }
    //     ],(err,res1)=>{
    //         if(err)
    //             console.log(`Error is ${JSON.stringify(err)}`)
    //         else
    //             console.log(`Success of noti waterfall ${JSON.stringify(res1)}`);
    //     })      
    // },

//=====================================================notification in app ============================================================
    
'single_notification': (token,title,msg,deviceType,custId) => {
        console.log(`Notification api hit`)
        var client = new Client();
        //var idArr = ['ebdbZ0Zgmkc:APA91bHbHeBbT__0Oor-nZunfGBWCUw23gkBLm1FvhQ7u30dfEdEzFxKDVe71SHkt9_Y68eueGCZ7yVuGdJN_SELrJgfeYf4nz9esINvts9My8-phyFqKuFXispIuCXQq1waroXvMNP7iJz6ORYCFTNlBdp28L55Qg','cOAjo2t143Q:APA91bErtsPQhPEhKeepyMQKihPMkOROAPP3RRduDJKzLLzlUNAATCrIRyW10dUa3JZ8zK1rRaIeeMqeNbNuS4PWy_0p9HcKA41k8MkbeQjdYUy--7_gNV13yIFM93IzHwBh5G3FAwk1LK2-XIzPBEzMVRNdf6ZYcA'];
        // idArr[0] = token;
        // set content-type header and data as json in args parameter
        var args = {
            data: { 
                "notification":{
                    "title":title,
                    "body":msg,
                    "sound":"default",
                    "click_action":"FCM_PLUGIN_ACTIVITY",
                    //"color":"#00ff00",
                    "icon":"icon"
                  },
                  "data":{
                    "param1":"gfdgdfghfd",//userId,
                    "param2":"valdfgdfgdfue2",
                  },
                    // "to":"ebdbZ0Zgmkc:APA91bHbHeBbT__0Oor-nZunfGBWCUw23gkBLm1FvhQ7u30dfEdEzFxKDVe71SHkt9_Y68eueGCZ7yVuGdJN_SELrJgfeYf4nz9esINvts9My8-phyFqKuFXispIuCXQq1waroXvMNP7iJz6ORYCFTNlBdp28L55Qg",
                    "to":token,
                    //"registration_ids": idArr,
                    "priority":"high",
                    "restricted_package_name":""
             },
            headers: { "Content-Type": "application/json", 
                        "Authorization":"key=AAAAY1CHoyw:APA91bH4iefE01IvbqubX1F72wUMA6p8TNq3BbkUPDQ2Cw6CJ0wuntKV87UjjAuVJX22UJHoisa23SVRZWUF67YKZGI-17Mrg3v3W7DIWhaWCbU-tTswWs5-CTClCFOyMTIV0L8JPo3Ct"
                     }
        };
        
        client.post("https://fcm.googleapis.com/fcm/send", args, function (data, response) {
            // parsed response body as js object
            console.log("in post===>",JSON.stringify(data))
            if(data.success){
                console.log(`Object of noti ${JSON.stringify(data)}`);
                let obj = {
                    userIds:[{uid:custId}],
                    //adminID:{aid:storeId},
                    noti_type: 'Delivery', 
                    content: msg
                };
                let noti  = new Noti(obj);
                noti.save((er1,ress)=>{
                    console.log(`Error is ${JSON.stringify(er1)}   result is ${JSON.stringify(ress)}`)
                    //response.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, 'Order has been placed successfully and confirmation code send to your mobile number.',result)
                })
            }else{
                console.log(`Object of noti ${JSON.stringify(data)}`);
            }
        });
    },
    
//=======================================================================================================================================

    // 'single_notificationGroceries': (token,title,msg,deviceType,storeId,custId,userId) => {
    //     console.log(`Notification api hit`)
    //     var client = new Client();
    //     //var idArr = ['ebdbZ0Zgmkc:APA91bHbHeBbT__0Oor-nZunfGBWCUw23gkBLm1FvhQ7u30dfEdEzFxKDVe71SHkt9_Y68eueGCZ7yVuGdJN_SELrJgfeYf4nz9esINvts9My8-phyFqKuFXispIuCXQq1waroXvMNP7iJz6ORYCFTNlBdp28L55Qg','cOAjo2t143Q:APA91bErtsPQhPEhKeepyMQKihPMkOROAPP3RRduDJKzLLzlUNAATCrIRyW10dUa3JZ8zK1rRaIeeMqeNbNuS4PWy_0p9HcKA41k8MkbeQjdYUy--7_gNV13yIFM93IzHwBh5G3FAwk1LK2-XIzPBEzMVRNdf6ZYcA'];
    //     // idArr[0] = token;
    //     // set content-type header and data as json in args parameter
    //     var args = {
    //         data: { 
    //             "notification":{
    //                 "title":title,
    //                 "body":msg,
    //                 "sound":"default",
    //                 "click_action":"FCM_PLUGIN_ACTIVITY",
    //                 //"color":"#00ff00",
    //                 "icon":"icon"
    //               },
    //               "data":{
    //                 "param1":userId,
    //                 "param2":"Order",
    //               },
    //                 // "to":"ebdbZ0Zgmkc:APA91bHbHeBbT__0Oor-nZunfGBWCUw23gkBLm1FvhQ7u30dfEdEzFxKDVe71SHkt9_Y68eueGCZ7yVuGdJN_SELrJgfeYf4nz9esINvts9My8-phyFqKuFXispIuCXQq1waroXvMNP7iJz6ORYCFTNlBdp28L55Qg",
    //                 "to":token,
    //                 //"registration_ids": idArr,
    //                 "priority":"high",
    //                 "restricted_package_name":""
    //          },
    //         headers: { "Content-Type": "application/json", 
    //                     "Authorization":"key=AAAAhTQQvgs:APA91bHYy14WxdIN6yAmGZJ3Utu07vukU3Yjonevmgq5-_zUeTkmgo2Aw_ldeNHJ7vLC29Iquoc1IqBQqabD_qSLDypMY3axWuHoN0N7JYMj3EbNyzmg9ApYQYDBiDiI9SZnt1JRVoWoYjV5ZVFZEOmGzMedL1Vv5A"
    //                  }
    //     };
        
    //     client.post("https://fcm.googleapis.com/fcm/send", args, function (data, response) {
    //         // parsed response body as js object
    //         console.log("in post===>",JSON.stringify(data))
    //         if(data.success){
    //             console.log(`Object of noti ${JSON.stringify(data)}`);
    //             let obj = {
    //                 userIds:[{uid:custId}],
    //                 adminID:{aid:storeId},
    //                 noti_type: 'Delivery', 
    //                 content: msg
    //             };
    //             let noti  = new Noti(obj);
    //             noti.save((er1,ress)=>{
    //                 console.log(`Error is ${JSON.stringify(er1)}   result is ${JSON.stringify(ress)}`)
    //                 //response.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, 'Order has been placed successfully and confirmation code send to your mobile number.',result)
    //             })
    //         }else{
    //             console.log(`Object of noti ${JSON.stringify(data)}`);
    //         }
    //         // raw response
    //         //console.log(response);
    //     });
    // },
    // 'single_notificationDeliveryStatusGroceries': (token,title,msg,deviceType,storeId,custId,userId) => {
    //     console.log(`Notification api hit`)
    //     var client = new Client();
    //     //var idArr = ['ebdbZ0Zgmkc:APA91bHbHeBbT__0Oor-nZunfGBWCUw23gkBLm1FvhQ7u30dfEdEzFxKDVe71SHkt9_Y68eueGCZ7yVuGdJN_SELrJgfeYf4nz9esINvts9My8-phyFqKuFXispIuCXQq1waroXvMNP7iJz6ORYCFTNlBdp28L55Qg','cOAjo2t143Q:APA91bErtsPQhPEhKeepyMQKihPMkOROAPP3RRduDJKzLLzlUNAATCrIRyW10dUa3JZ8zK1rRaIeeMqeNbNuS4PWy_0p9HcKA41k8MkbeQjdYUy--7_gNV13yIFM93IzHwBh5G3FAwk1LK2-XIzPBEzMVRNdf6ZYcA'];
    //     // idArr[0] = token;
    //     // set content-type header and data as json in args parameter
    //     var args = {
    //         data: { 
    //             "notification":{
    //                 "title":title,
    //                 "body":msg,
    //                 "sound":"default",
    //                 "click_action":"FCM_PLUGIN_ACTIVITY",
    //                 //"color":"#00ff00",
    //                 "icon":"icon"
    //               },
    //               "data":{
    //                 "param1":userId,
    //                 "param2":"Delivery",
    //               },
    //                 // "to":"ebdbZ0Zgmkc:APA91bHbHeBbT__0Oor-nZunfGBWCUw23gkBLm1FvhQ7u30dfEdEzFxKDVe71SHkt9_Y68eueGCZ7yVuGdJN_SELrJgfeYf4nz9esINvts9My8-phyFqKuFXispIuCXQq1waroXvMNP7iJz6ORYCFTNlBdp28L55Qg",
    //                 "to":token,
    //                 //"registration_ids": idArr,
    //                 "priority":"high",
    //                 "restricted_package_name":""
    //          },
    //         headers: { "Content-Type": "application/json", 
    //                     "Authorization":"key=AAAAhTQQvgs:APA91bHYy14WxdIN6yAmGZJ3Utu07vukU3Yjonevmgq5-_zUeTkmgo2Aw_ldeNHJ7vLC29Iquoc1IqBQqabD_qSLDypMY3axWuHoN0N7JYMj3EbNyzmg9ApYQYDBiDiI9SZnt1JRVoWoYjV5ZVFZEOmGzMedL1Vv5A"
    //                  }
    //     };
        
    //     client.post("https://fcm.googleapis.com/fcm/send", args, function (data, response) {
    //         // parsed response body as js object
    //         console.log("in post===>",JSON.stringify(data))
    //         if(data.success){
    //             console.log(`Object of noti ${JSON.stringify(data)}`);
    //             let obj = {
    //                 userIds:[{uid:custId}],
    //                 adminID:{aid:storeId},
    //                 noti_type: 'Delivery', 
    //                 content: msg
    //             };
    //             let noti  = new Noti(obj);
    //             noti.save((er1,ress)=>{
    //                 console.log(`Error is ${JSON.stringify(er1)}   result is ${JSON.stringify(ress)}`)
    //                 //response.sendResponseWithData(res, responseCode.EVERYTHING_IS_OK, 'Order has been placed successfully and confirmation code send to your mobile number.',result)
    //             })
    //         }else{
    //             console.log(`Object of noti ${JSON.stringify(data)}`);
    //         }
    //         // raw response
    //         //console.log(response);
    //     });
    // },
    

//************************************************ Android Push (not) *************************************************************************/
    // 'android_push' : (storeId,title,msg) => {
    //     console.log(" android  device_token and message----", msg);
            
    //     var serverKey = 'AAAAhTQQvgs:APA91bHYy14WxdIN6yAmGZJ3Utu07vukU3Yjonevmgq5-_zUeTkmgo2Aw_ldeNHJ7vLC29Iquoc1IqBQqabD_qSLDypMY3axWuHoN0N7JYMj3EbNyzmg9ApYQYDBiDiI9SZnt1JRVoWoYjV5ZVFZEOmGzMedL1Vv5A';
    //     var title=title;
    //     var fcm = new FCM(serverKey);
    //     var message = { 
    //         to: "dSIXFWKCuzo:APA91bHVD6S8aRYNWI2lMNmcnAos08nkXVqpQtJcM5kV1qtKCM3xN4w3GniPB-Yc7aILapkLNehQH91Dgg3zK8aPKe38L6hAfKJfqj_HGs5ypWz9SjUzDZIuQdhZQ0uBZ7_GUitz8GxtRcta-BZBVlQ7iIgwpzNQ1Q", 
    //         collapse_key: 'your_collapse_key', 
    //         // notification: {
    //         //     title: 'Title of your push notification', 
    //         //     body: msg,
    //         //     "actions": [
    //         //         { "icon": "emailGuests", "title": "EMAIL GUESTS",foreground:false },
    //         //         { "icon": "snooze", "title": "SNOOZE", foreground:false}
    //         //     ] 
    //         // },   

    //         // notification: {
    //         //     title: 'Title of your push notification', 
    //         //     body: 'Body of your push notification' 
    //         // },   

    //         // notification: {
    //         //     title: 'Title of your push notification', 
    //         //     body: msg 
    //         // },   
    //         data: {
    //             title :'Helposity'
    //             , message : msg,
    //             "actions": [
    //                     { "icon": "emailGuests", "title": "EMAIL GUESTS",foreground:false },
    //                     { "icon": "snooze", "title": "SNOOZE", foreground:false}
    //                 ] 
    //         }
    //         // 'data.message': msg,
    //         // 'data.title': 'Title of your push notification'
    //     };
    //     console.log('before send android_push message---->',JSON.stringify(message));
    //     fcm.send(message, function(err, response){
    //         if (err) {
    //             console.log("error-->"+err);
    //         } else {
    //             console.log('Android notification sent Successfully********',response);
    //             //console.log("Successfully sent with response: "+response);
    //         }
    //     });
    // },
    // 'ios_push':function(deviceToken,msg,notification_sound){
    //     console.log('ios deviceToken -->>',deviceToken,msg)
    //     var options = {
    //         "cert": "MobiloitteEnterpriseDistribution.pem",
    //         "key":  "MobiloitteEnterpriseDistribution.pem",
    //         "passphrase": "Mobiloitte1",
    //         "gateway": "gateway.push.apple.com",
    //         //"gateway": "gateway.sandbox.push.apple.com",
    //         "port": 2195,
    //         "enhanced": true,
    //         "cacheLength": 5
    //     }; 
    //     var apnConnection = new apn.Connection(options);
    //     var myDevice = new apn.Device(deviceToken);
    //     var note = new apn.Notification();

    //     note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    //     //note.badge = 1;
    //     note.alert = msg;
    //     if(notification_sound){
    //         note.sound = "default";
    //     } 
    //     note.payload = {"message":msg};
    //     try{
    //         apnConnection.pushNotification(note, myDevice);
    //         console.log('iOS Push Notification send');
    //     } catch(ex){
    //         console.log('iOS Push Notification send catch',ex);
    //     }
          
          
    // }


//============================================ Module Export =======================================================================
}
module.exports = notifications;