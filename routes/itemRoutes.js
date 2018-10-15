const global = require('../helper/globalRoutes')

// global.router.post('/searchLaundry',global.authHandler.auth_func, global.laundry.searchLaundry)
global.router.post('/addItem', global.item.addItem)


module.exports = global.router;