var anujRoutes=require('express').Router()
var anujHandler =  require('../webservices/anuj.js')

anujRoutes.post('/signUp',anujHandler.signUp);
anujRoutes.post('/verifyOtp',anujHandler.verifyOtp);
anujRoutes.post('/resendOtp',anujHandler.resendOtp);
// anujRoutes.get('/logIn/:email/:password',anujHandler.logIn);
anujRoutes.post('/logIn',anujHandler.logIn);
anujRoutes.post('/forgotPassword',anujHandler.forgotPassword);
anujRoutes.post('/resetPassword',anujHandler.resetPassword);
anujRoutes.post('/laundrySignUp',anujHandler.laundrySignUp);
anujRoutes.post('/AddlaundryByAdmin',anujHandler.AddlaundryByAdmin);
anujRoutes.get('/LoginApi',anujHandler.LoginApi);
anujRoutes.get('/NumberOfLaundry',anujHandler.NumberOfLaundry);
anujRoutes.get('/NumberOfUsers',anujHandler.NumberOfUsers);
anujRoutes.get('/NumberOfSubAdmin',anujHandler.NumberOfSubAdmin);
anujRoutes.post('/getNotificationList',anujHandler.getNotificationList);
anujRoutes.post('/getLaundryList',anujHandler.getLaundryList);
anujRoutes.post('/editLaundryDetails',anujHandler.editLaundryDetails);
anujRoutes.post('/addSubAdmin',anujHandler.addSubAdmin);
anujRoutes.post('/test',anujHandler.test);//for push notification...............
anujRoutes.post('/getSubAdminDetail',anujHandler.getSubAdminDetail)
anujRoutes.post('/updateSubAdmin',anujHandler.updateSubAdmin)
anujRoutes.post('/blockSubadmin',anujHandler.blockSubadmin)
anujRoutes.post('/blockLaundry',anujHandler.blockLaundry)
anujRoutes.get('/getParticularUser/:_id',anujHandler.getParticularUser)

anujRoutes.post('/viewlaundryDetail',anujHandler.viewlaundryDetail)

//.................gagan notification .......................
anujRoutes.post('/deleteParticularNotification',anujHandler.deleteParticularNotification)
anujRoutes.post('/deleteAllNotification',anujHandler.deleteAllNotification)


module.exports=anujRoutes;