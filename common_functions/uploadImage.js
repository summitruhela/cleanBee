//==========================  Import External Module Start =====================

const cloudinary = require('cloudinary');

const cloud_const = require('../config/config')();
//==========================  Configuring Cloudinary Here =====================

cloudinary.config({
	cloud_name   : cloud_const.cloudinary.CLOUD_NAME,
	api_key      : cloud_const.cloudinary.API_KEY,
	api_secret   : cloud_const.cloudinary.API_SECRET
})
//==========================  Function declartion =====================


function uploadImage(image_data,callback){
  var binaryData = new Buffer(image_data,'base64');
  console.log("dfghsdsghds",binaryData)
  return  cloudinary.uploader.upload(image_data,function(result){
   if(result){
     console.log(result.url)
     callback(null,result.url);
    }
  })
}

//========================== Export module start =======================

module.exports = {
  uploadImage
};