const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    laundryId: {
        type: Schema.Types.ObjectId,
        ref:'Laundry'
    },
    // laundryOwnerId: {
    //     type: Schema.Types.ObjectId,
    //     ref:'User'
    // },
    itemName: {
        type: String
    },
    // itemType: {
    //     type: String
    // },
    itemPrice:{
        type: String
    },
    // itemPic: {
    //     type: String
    // },
    status: {
        type: String,
        enum: ["ACTIVE","INACTIVE","BLOCK"],
        default: "ACTIVE"
    },
    createdAT:{
        type:Number,
        default:Date.now()
    }
},{
    timestamps: true
});

itemSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Item",itemSchema);

// laundryName: {
//     type: String
// },
// laundryId:{
//     type: Number
// },
// ItemId: {
//     type: Schema.Types.ObjectId,
//     ref: "Item"
// },
// laundryOwnerId: {
//     type: Schema.Types.ObjectId,
//     ref: "User"
// },
// laundryImage: [
//      String
// ],
// productPrice: {
//     type: Number
// },
// distance:{  //any one dist/loc
//     type:String
// },
// location:{             //any one dist/loc
//     coordinates:{
//         type:[Number]
//     }
// },
// address: {
//     country:{type:String},state:{type:String},unitNo:{type:String},areaName:{type:String},houseNo:{type:String},streetNo:{type:String},poBox:{type:Number},city:{type:String},distance:{type: String},location:{coordinates:{type:[Number]}}
// },