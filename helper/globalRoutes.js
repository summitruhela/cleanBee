const global = {

    router :require('express').Router(),
    user:require('../webservices/userController'),
    authHandler :require('../middleware/auth_handler'),
    validators: require('../middleware/validators'),
    laundry :require('../webservices/laundryController'),
    orders :require('../webservices/orderController'),
    item :require('../webservices/itemController'),
    payment :require('../webservices/paymentController'),
    notification :require('../webservices/notificationController'),

 };
 module.exports = global;