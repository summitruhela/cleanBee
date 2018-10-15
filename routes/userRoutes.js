//const router = require('express').Router();
// const usersApi = require('../webservices/userController');
//const authHandler = require('../middleware/auth_handler');
const global = require('../helper/globalRoutes')
global.router.post('/imageUpload',global.authHandler.auth_func, global.user.imageUpload)
global.router.post('/register', global.user.register)
global.router.post('/completeSignup',global.user.completeSignup)
global.router.post('/login', global.user.login)
global.router.post('/verifyOTP', global.user.verifyOTP)
global.router.post('/resendOTP', global.user.resendOTP)
global.router.post('/resetPassword', global.user.resetPassword)
global.router.post('/forgotPassword',global.user.forgotPassword)
//global.router.post('/setProfile', global.user.setProfile)
global.router.post('/logOut', global.user.logOut)
global.router.post('/getProfile', global.authHandler.auth_func,global.user.getProfile)
global.router.post('/changePassword', global.authHandler.auth_func,global.user.changePassword)
global.router.post('/addAddress', global.user.addAddress)
global.router.post('/editProfile',global.user.editProfile),
global.router.post('/editAddress',global.user.editAddress)
global.router.post('/deleteAddress',global.user.deleteAddress)
global.router.post('/getUserAddress',global.user.getUserAddress)
// router.post('/signup', usersApi.signup);
// router.post('/login', usersApi.login);
// router.post('/sendLinkorOtptoUsers',usersApi.sendLinkorOtptoUsers);
// router.post('/matchOTP',usersApi.matchOTP);
// router.post('/resetPassword', usersApi.resetPassword);
// router.post('/imageUpload',authHandler.auth_func,usersApi.imageUpload)
// router.post('/logOut',usersApi.logOut);
module.exports = global.router;