'use strict';
const validator = require('../schemas/validator_get_everyone');
const controller = require('../schemas/controller_get_everyone');


module.exports = {
  method: 'GET',
  path: '/everyone',
  config: {
    description: 'listing data of all Citizens',
    notes: 'listing data : {id, handle, nickname, character_id}"',
    tags: ['dev'],
    response: {
      schema: validator.response
    },
    auth: false
  },
  handler: (request, reply) => {
    controller.action(reply);
  }
};
