const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const laundrySchema = new Schema({
    laundryName: {
        type: String
    },
    laundryImage:{      //in admin panel add laudary
        type:String
    },
    EmailAddres:{     //in admin panel add laudary
        type:String
    },
    DOB:{     // in admin panel add laudary
        type:String
    },
    Gender:{// in admin panel add laudary
        type:String
    },
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    phoneNumber:{
        type:Number
    },
    otp:{
        type:Number
    },
    password:{
        type:String
    },
    laundryId:{
        type: Number
    },
    laundryOwnerId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    laundryOwnerName: {
        type: String
    },
    laundryContact:{ 
          type:String
        },
    distance:{  //any one dist/loc
        type:String,
        default:"1 Km"
    },
    countryCode:{  
        type:String
    },
    addresses:[{
     unitNumber:"",
     areaName:"",
     houseNumber:"",
     streetNumber:"",
     poBoxNumber:""
    }],
    coordinates: {
                type: [Number],
                index:"2dsphere",
                default: [77.216721, 28.644800]
                },
    laundryItems:[{
      itemName:"",
       price:"",
        status:{ type:String,enum:["ACTIVE","DELETE"],default:"ACTIVE"}
    }],
    usersOrder:[{userId:{
        type:Schema.Types.ObjectId,ref:'User'}}],
    // laundryAddress: {
    //     country:{type:String},state:{type:String},unitNo:{type:String},areaName:{type:String},houseNo:{type:String},streetNo:{type:String},poBox:{type:Number},city:{type:String},distance:{type: String}, location: {
    //         type: {
    //         type: String,
    //         default: 'Point'
    //         },
    //         coordinates: {
    //         type: [Number],
    //         default: [0, 0]
    //         }
    //         }
    // },
    /*
    Subadmin that is added by admin from admin panel
    Laundry is same like subadmin , but this is sign up it's own not by ADMIN.
    */
    type:{
    type:String,
    default:"LAUNDRY"
    },
    status: {
        type: String,
        enum:["ACTIVE","BLOCK","DELETE","INACTIVE"],
        default: "ACTIVE"
    },
    createdBy:{
        type:String
    },
    createdAT:{
        type:Number,
        default:Date.now()
    }
});
laundrySchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Laundry',laundrySchema);

