const global = require('../helper/globalRoutes')

// global.router.post('/searchLaundry',global.authHandler.auth_func, global.laundry.searchLaundry)
global.router.post('/pay', global.payment.pay)
global.router.post('/paymentMode', global.payment.paymentMode)
global.router.post('/paymentStatusUpdate', global.payment.paymentStatusUpdate)




module.exports = global.router;