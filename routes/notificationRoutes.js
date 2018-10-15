const global = require('../helper/globalRoutes')

//global.router.post('/searchLaundry',global.authHandler.auth_func, global.laundry.searchLaundry)

global.router.post('/saveToken', global.notification.saveToken)
global.router.post('/notificationList', global.notification.notificationList)
global.router.post('/unreadCount', global.notification.unreadCount)
global.router.post('/updateReadStatus', global.notification.updateReadStatus)
//global.router.post('/saveToken', global.notification.saveToken)

module.exports = global.router;