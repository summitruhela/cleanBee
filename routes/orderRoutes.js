const global = require('../helper/globalRoutes')

// global.router.post('/searchLaundry',global.authHandler.auth_func, global.laundry.searchLaundry)
//global.router.post('/incDecInItem', global.orders.incDecInItem)
global.router.post('/placeOrder', global.orders.placeOrder)
global.router.post('/OrderDetails1', global.orders.OrderDetails1)
global.router.post('/customerOrders', global.orders.customerOrders)
global.router.post('/viewParticularOrderDetails', global.orders.viewParticularOrderDetails)
global.router.post('/orderSummary', global.orders.orderSummary)
global.router.post('/addDeliveryAddress', global.orders.addDeliveryAddress)
global.router.post('/cancelParticularOrder', global.orders.cancelParticularOrder)



module.exports = global.router;