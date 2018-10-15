var router=require('express').Router()
var web =  require('../webservices/webController.js')


router.post('/laundrySignUp', web.laundrySignUp);
router.post('/verifyOtp', web.verifyOtp);
router.post('/resendOtp', web.resendOtp);
router.post('/logIn', web.logIn);
router.post('/logout', web.logout);
router.post('/resetPassword', web.resetPassword);
router.post('/setlaundryProfile', web.setlaundryProfile);
router.get('/getLaundryProfile/:_id', web.getLaundryProfile);
router.post('/changePassword', web.changePassword);
router.post('/addItem', web.addItem);
//router.post('/ItemList', web.ItemList);

module.exports=router;