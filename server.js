const express = require('express');
const bodyParser  =  require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const environment = require('./config/config')();
const app = express();
const dbconnection = require('./db_handler/mongodb');
const user =  require('./models/userModel')
const common = require('./common_functions/message');
const CronJob = require('cron').CronJob;
const response = require('./common_functions/response_handler');
const responseCode = require('./helper/httpResponseCode');
const responseMessage = require('./helper/httpResponseMessage');
const morgan = require('morgan');
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.get('/',(req,res)=>{
    res.send("server is running")
})

//app.set('supersecret',environment.secret_key);
app.use(cors());  


app.use('/api/v1/user',require('./routes/userRoutes'));
app.use('/api/v1/laundry',require('./routes/laundryRoutes'));
app.use('/api/v1/order',require('./routes/orderRoutes'));
app.use('/api/v1/static', require('./routes/termsAndPrivacyRoutes'));
app.use('/api/v1/item', require('./routes/itemRoutes'));
app.use('/api/v1/payment', require('./routes/paymentRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/web', require('./routes/webRoutes'));
app.use('/', require('./routes/anujRoutes'));


app.use(express.static(path.join(__dirname, 'dist')));

// app.get('*', (req, res) => {
// res.sendFile(__dirname + '/dist/index.html')
// });


// app.listen(8080,()=>{
//     console.log(`Server is running on ${environment.port}`)
// })

app.listen(environment.port,()=>{
    console.log(`Server is running on ${environment.port}`)
})