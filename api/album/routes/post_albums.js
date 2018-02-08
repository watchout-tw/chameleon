'use strict';
const validator = require('../schemas/validator_post_album');
const controller = require('../schemas/controller_post_album');
const decodeJWT = require('../../../tools/decodeJWT');
//const roles = require('../../../tools/roles');

module.exports = {
  method: 'POST',
  path: '/albums',
  config: {
    description: 'upload image to imgur',
    validate: {
      payload: validator.payload,
    },
    response: {
      schema: validator.response
    }
    ,
    payload: {
      //output: 'stream',
      //parse: false,
      maxBytes: 10 * 1000 * 1000
    }
  },
  handler: (request, reply) => {
    /*
    let actionPayload = {
      decodedData: null,
      request: request,
      reply: reply
    };
    controller.action(actionPayload);*/
    decodeJWT.decode(request, false, null, controller, reply);
  }
};

