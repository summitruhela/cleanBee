const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  
    orderNo: {
        type: String
    },
    orderDetails: [{ itemId:{type: Schema.Types.ObjectId,ref:'Item'},action:{type: String},quantity:{type: Number},price:{type:Number},
    sameAction:{type:Boolean},differentAction:[{clothType:{type:String},description:{type:String},action:{type:String}}] }],
    
    totalAmount:{
        type:String
    },
    
    customerId:{
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    laundryId:{
        type:Schema.Types.ObjectId,
        ref:"Laundry"
    },
    pickUpAddress:{}, //pick up point for clothes
    deliveryAddress:{}, // delivery address for clothes
    deliveryType: {
        type: String
    },
    modeOfDelivery:{
        type:String,
        enum:["Quick","Regular"],
        default:"Regular"
    },
    orderItem:{},
    transactionHash:{
        type:String
    },
    modeOfPayment: {
        type: String,
        enum:["PickUp","ViaCard"],
        default: "PickUp",
       
    },
    paymentStatus: {
        type: String,
        default: "Pending",
        enum: ['Recieved','Pending']
    },
    deliveryTime: {
        type: String
    },
    deliveryCharge: {
        type: String,
        default:"30"
    },
    deliveryStatus: {
        type: String,
        default: "Pending",
        enum: ['Delivered','Pending']
    },
    status:{
        type:String,
        default:"ACTIVE"
    },
    createdAT:{
        type:Number,
        default:Date.now()
    }
}, {
    timestamps: true
}
);

orderSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Order',orderSchema);