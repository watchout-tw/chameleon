'use strict';
//const fs = require('fs');
const async = require('async');
const error = require('../../../tools/error');
const message = require('../../../tools/message');
const tunnelImgur = require('../../../tools/tunnel/tunnel_imgur');
const tunnelWaa = require('../../../tools/tunnel/tunnel_waa');

const action = (actionPayload) => {

  let payload = actionPayload.request.payload;
  let reply = actionPayload.reply;

  let resData = '';

  async.waterfall([
    (callback) => {
      if (!checkBase64(payload.image)){
        callback({code:400,msg:'The image format must be base64 encoding!'});
      }
      else {
        tunnelImgur.upload_image(payload,callback);
      }
    },
    (uploadObj, callback) => {
      console.log('PSOT callback :',callback);
      if (uploadObj.hasOwnProperty('link')){
        resData = uploadObj;
        tunnelWaa.short_link(
          {url:uploadObj.link},
          callback
        );
      }
      else {
        callback({code:400,msg:'Upload error!'});
      }
    },
    (shortURLRes, callback) => {
      console.log('shortURLRes :'.shortURLRes);
      if (shortURLRes.hasOwnProperty('shortUrlHash')){
        resData.link = 'http://35.184.38.66:3389/' + shortURLRes.shortUrlHash;
        callback(null,resData);
      }
      else {
        callback({code:400,msg:'Upload error!'});
      }
    },
  ], function (err, results) {

    if (!err){
      console.log('results :',results);
      
      message.MsgObject(results, reply);
    }
    else {
      error.handle(err,reply);
    }
  });

};

const checkBase64 = (base64Data) => {
  let base64Rejex = /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i;

  console.log('[Cintroller POST upload] Check IMG if base64 :',base64Rejex.test(base64Data));

  return ( base64Rejex.test(base64Data)); // base64Data is the base64 string)
};

module.exports = {
  action: action
};
