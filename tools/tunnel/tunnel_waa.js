'use strict';
const config = require('config');
const rp = require('request-promise');
/**
  * short URL
  * @param {object} payload - payload object.
  *   @param {string} payload.url - url
  * @param {object} callback - The callback object
  */
const short_link = (payload,callback) => {
  console.log('waa callback :',callback);
  let options = {
    method: 'POST',
    uri: config.commons.waaServerURL,
    body: {
      url: payload.url
    },
    json: true // Automatically stringifies the body to JSON
  };

  rp(options)
  .then(function (parsedBody) {
    console.log('parsedBody:',parsedBody);
    callback(null,parsedBody);
  })
  .catch(function (err) {
    callback({code:400,msg:err});
  });
};

module.exports = {
  short_link: short_link
};
