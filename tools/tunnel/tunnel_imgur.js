'use strict';
const rp = require('request-promise');
/**
  * Link to Imgur API 
  * @param {object} payload - payload object.
  *   @param {string} payload.image - base64 code of image
  *   @param {string} payload.album - album id of image
  *   @param {string} payload.name - name of image
  *   @param {string} payload.title - title of image
  *   @param {string} payload.description - description of image
  * @param {object} callback - The callback object
  */
const toeken = '745695c2dca6cba00c9ca089035440e9a446346b';
const defaultAlbum = 'Di7nN';
const defaultName = 'watchoutTW_img_'+Date.now();
const defaultTitle = 'wathcoutTW Image';
const defaultDescription = 'Upload by watchoutTW';

const upload_image = (payload,callback) => {
  
  let options = {
    method: 'POST',
    uri: 'https://api.imgur.com/3/image',
    body: {
      image: payload.image,
      album: defaultData('album',payload.album),
      name: defaultData('name',payload.name),
      title: defaultData('title',payload.title),
      description: defaultData('description',payload.description),
      type: 'base64'
    },
    headers: {
      'Authorization': 'Bearer ' + toeken
    },
    json: true // Automatically stringifies the body to JSON
  };

  //console.log('send body :',options);

  rp(options)
  .then(function (parsedBody) {
    //console.log(parsedBody);
    callback(null,parsedBody.data);
  })
  .catch(function (err) {
    callback({code:400,msg:err});
  });
};

/**
  * Filling  'null'  or empty data field
  * @param {string} type - Type of the data
  * @param {item} item - Value of the data
  */
const defaultData = (type,item)  => {

  let val = '';
  if (item === null || item === undefined || item === '') {
    switch (type) {
    case 'album':
      val = defaultAlbum;
      break;
    case 'name':
      val = defaultName;
      break;
    case 'title':
      val = defaultTitle;
      break;
    case 'description':
      val = defaultDescription;
      break;
    }
    return val;
  }
  else {
    return item;
  }
};

module.exports = {
  upload_image: upload_image,
};
