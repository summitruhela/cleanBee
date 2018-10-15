var router=require('express').Router()
var admin =  require('../webservices/adminController.js')


router.post('/login',admin.login);
router.post('/sendLink',admin.sendLink);
router.post('/resetPassword',admin.resetPassword);
router.post('/changePassword',admin.changePassword);
router.post('/getAdminProfile',admin.getAdminProfile);
router.post('/logout',admin.logout);
router.post('/editAdminProfile',admin.editAdminProfile);
router.post('/updatelaundryStatus',admin.updatelaundryStatus);
router.post('/acceptOrderList',admin.acceptOrderList);
router.post('/closeOrderList',admin.closeOrderList);
router.post('/openOrderList',admin.openOrderList);
router.post('/orderDetails',admin.orderDetails);
// router.post('/saveStatic', static.saveStatic);
router.post('/updateStatic', admin.updateStatic);
router.post('/getStaticContent', admin.getStaticContent);
//router.get('/getStaticContentAdmin', admin.getStaticContentAdmin);

router.post('/addCustomer', admin.addCustomer);
router.post('/customerList', admin.customerList);
router.get('/getCustomerDetail/:customerId', admin.getCustomerDetail);
router.post('/updateCustomerStatus', admin.updateCustomerStatus);
router.get('/getOrderDetail/:orderId', admin.getOrderDetail);
router.post('/editCustomerProfile', admin.editCustomerProfile);


module.exports=router;