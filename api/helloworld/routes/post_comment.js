'use strict';
const schemas = require('../schemas/basic');

module.exports = {
  method: 'POST',
  path: '/comment',
  config: {
    validate: {
      params: schemas.creationParamSchema,
      payload: schemas.creationSchema
    }
  },
  handler: (request, reply) => {
    reply('Hello!');
  }
};
