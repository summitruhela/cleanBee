const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    addedItem: [{
        itemId:{type:Schema.Types.ObjectId, ref:'Item'},quantity:{type:Number},status:{type:String,default:"ACTIVE"},laundryId:{type:Schema.Types.ObjectId,ref:"laundry"}
    }],
    createdAT:{
        type:Number,
        default:Date.now()
    }
    // deliveredCartItem:[{
    //     type: String
    // }
    // ]
},{
    timestamps: true
}); 

module.exports = mongoose.model('Cart',cartSchema);