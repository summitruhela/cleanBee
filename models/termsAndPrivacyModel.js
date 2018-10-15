const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const termsPrivacySchema = new Schema({
    updatedBy:{
        type:Schema.Types.ObjectId,
        ref:'Users'
    },

    termsAndConditions: {
        type: String
    },
    aboutUs: {
        type: String
    },
    privacyPolicy: {
        type: String
    },
    whyUs:{
        type:String,
        default: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
        ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
        atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`
    },
    howItWork:{
        type:String,
        default: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
        ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
        atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`
    },
    HomePageOffer:{
        type:String,
        default: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
        ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
        atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`
    },
    QuickService:{
        type:String,
        default: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
        ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
        atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`
    },
    RegularService:{
            type:String,
            default: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
            ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
            atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`
        },
    
    tutorial:[{tutorialData:{
        type: String
    },
  
    tutorialImage:{
        type: String,
        default:"http://res.cloudinary.com/dnjgq0lig/image/upload/v1536756085/ywsejdhphoszyeambiie.jpg"
    }
    }],
    call:{
        type: String,
        default:"+91-9876543212"
    },
    mail:{
        type: String,
        default:"abc@gmail.com"
    },
    whatsApp:{
        type: String,
        default:"+91-9876543212"
    },
    status:{
        type:String,
        default:"ACTIVE"
    }
},{
    timestamps: true
});

module.exports = mongoose.model("Static",termsPrivacySchema);

mongoose.model('Static',termsPrivacySchema).find((error,result)=>{
    if(result.length==0)
    {
        let obj = {
            termsAndConditions: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
            ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
            atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`,
            // tutorial: [`<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
            // ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
            // atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`],
            aboutUs: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
            ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
            atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`,
            privacyPolicy: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
            ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
            atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`
           
        };
      let obj1 = {
            $push: {
                tutorial: {
                    tutorialData:  `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
                 ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
                 atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`,
            tutorialImage:"http://res.cloudinary.com/dnjgq0lig/image/upload/v1536756085/ywsejdhphoszyeambiie.jpg"
                }
            }
        };
     
        mongoose.model('Static',termsPrivacySchema).create(obj,(error,success)=>{
            if(error)
                console.log("Error is"+ error)
            else
                {console.log("Static content saved succesfully.");
                mongoose.model('Static',termsPrivacySchema).findByIdAndUpdate({_id:success._id},obj1,{new:true},(err,result)=>{
                    if(err)
                    console.log("Error is updateion"+ err)   
                    else{
                     console.log("Static content updated succesfully.");
                    }
                })
            }

        })
    }
})