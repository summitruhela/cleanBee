const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const notificationSchema = new Schema({
    notification:{},
    userIds: [{
        uid:{type:Schema.Types.ObjectId,ref:'Users'},
        isRead:{type:Boolean, default:false}
    }],
    userId:{
         type:Schema.Types.ObjectId,
         ref:'Users'
    },
    laundryId:{
        type:Schema.Types.ObjectId,
        ref:'Laundry'
    },
    noti_type:{
        type:String
    },
    content:{
        type: String
    },
    status:{
        type:String,
        default:"ACTIVE",
        enum:['ACTIVE','INACTIVE','DELETE','BLOCK']
    },
    createdAt:{
        type:String,
        default:Date.now()
    },
    createdAt1:{
        type:Date,
        default:Date.now()
    }
});
notificationSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Notification",notificationSchema);
// const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate');
// const notificationSchema = new Schema({
//     notification:{},
//     userIds: [{
//         uid:{type:Schema.Types.ObjectId,ref:'Users'},
//         isRead:{type:Boolean, default:false}
//     }],
//     userId:{
//          type:Schema.Types.ObjectId,
//          ref:'Users'
//     },
//     laundryId:{
//         type:Schema.Types.ObjectId,
//         ref:'Laundry'
//     },
//     noti_type:{
//         type:String
//     },
//     content:{
//         type: String
//     },
//     status:{
//         type:String,
//         default:"ACTIVE",
//         enum:['ACTIVE','INACTIVE','DELETE','BLOCK']
//     },
//     createdAt:{
//         type:String,
//         default:Date.now()
//     },
//     createdAt1:{
//         type:Date,
//         default:Date.now()
//     }
// });
// notificationSchema.plugin(mongoosePaginate);
// module.exports = mongoose.model("Notification",notificationSchema);


























// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// const mongoosePaginate = require('mongoose-paginate');

// const notificationSchema = new Schema({
//     notification:{
//         type:String
//     },
//     laundryID:{
//         lid:{type:Schema.Types.ObjectId,ref:'Users'},
//         isRead:{type:Boolean, default:false}
//     },
    
//     userIds: {
//         uid:{type:Schema.Types.ObjectId,ref:'Users'},
//         isRead:{type:Boolean, default:false}
//     },
    
//     noti_type:{
//         type:String
//     },
//     content:{
//         type: String
//     },
//     status:{
//         type:String,
//         default:"ACTIVE",
//         enum:['ACTIVE','INACTIVE']
//     },
//     createdAt:{
//         type:String,
//         default:Date.now()
//     }
// });

// notificationSchema.plugin(mongoosePaginate);
// module.exports = mongoose.model("Notification",notificationSchema);