'use strict';

const Joi = require('joi');

module.exports = {
  creationParamSchema: Joi.object().keys({
    requestId: Joi.number().positive().integer()
  }),
  creationSchema: Joi.object().keys({
    content: Joi.object({
      msg: Joi.string()
    })
  })
};
