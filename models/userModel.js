const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    adminName: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    dob: {
        type: String,
    },
    profilePic: {
        type: String
    },


    password: {
        type: String
    },
    address: [{
        unitNo: {
            type: String
        },
        areaName: {
            type: String
        },
        houseNo: {
            type: String
        },
        streetNo: {
            type: String
        },
        poBox: {
            type: String
        },
        location: {
            type: {
                type: String,
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        }
    }],
    deliveryAddresses: [{
        addressType: {
            type: String,
            default: "PickUpAddress"
        },
        country: {
            type: String
        },
        state: {
            type: String
        },
        unitNo: {
            type: String
        },
        areaName: {
            type: String
        },
        houseNo: {
            type: String
        },
        streetNo: {
            type: String
        },
        poBox: {
            type: Number
        },
        city: {
            type: String
        },
        location: {
            type: {
                type: String,
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        }
    }],
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE']
    },
    type: {
        type: String,
        default: "CUSTOMER"
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE", "BLOCK"],
        default: "ACTIVE"
    },
    otp: {
        type: Number
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    pushNotification: {
        type: Boolean,
    },
    jwt: {
        type: String
    },
    deviceToken: {
        type: String
    },
    deviceType: {
        type: String
    },
    permissions: {
        customerMgnt: {
            type: Boolean,
            default:false
        },
        subAdminMagmt:{
            type: Boolean,
            default:false
        },
        orderMgnt: {
            type: Boolean,
            default:false
        },
        laundryMgnt: {
            type: Boolean,
            default:false
        },
        staticContentMgnt: {
            type: Boolean,
            default:false
        },
        dashboardMgmt: {
            type: Boolean,
            default:false
        }
    },
    createdBy:{
        type:String
    },
    countryCode:{
        type:String
    },
    createdAT:{
        type:Number,
        default:Date.now()
    }
}, {
    timestamps: true
});

userSchema.plugin(mongoosePaginate);
userSchema.index({
    "addresses[0].location.coordinates": "2dsphere"
});
module.exports = mongoose.model('Users', userSchema);


mongoose.model('Users', userSchema).findOne({
    type: "ADMIN"
}, (err, res) => {
    if (!res) {
        let obj = {
            adminName: "admin",
            password: "anshul",
            type: "ADMIN",
            email: "ph-anshul@mobiloitte.com",
            phone: "+911234567890",
            deliveryAddresses: [{
                location: {
                    coordinates: [0, 0]
                }
            }],
            permissions : {
                customerMgnt:true,
                subAdminMagmt:true,
                orderMgnt:true,
                laundryMgnt:true,
                staticContentMgnt:true,
                dashboardMgmt:true
            }
        };
        var pass;
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, (err1, salt) => {
            bcrypt.hash(obj.password, salt, (err2, hash) => {
                obj.password = hash;
                mongoose.model('Users', userSchema).create(obj, (error, success) => {
                    if (error)
                        console.log("Error is" + error)
                    else
                        console.log("User saved succesfully.");
                })
            })
        });
    }
});