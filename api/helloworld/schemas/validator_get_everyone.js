'use strict';

const Joi = require('joi');

const response = Joi.alternatives().try(
  Joi.object({
    data: Joi.array()
  })
);

module.exports = {
  response: response
};
