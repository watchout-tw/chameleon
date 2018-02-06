'use strict';

const Joi = require('joi');

const payload = Joi.alternatives().try(
  Joi.object({
    image: Joi.string().required(),
    album: Joi.string().allow(null).notes('albumID'),
    name: Joi.string().allow(null).notes('name'),
    title: Joi.string().allow(null).notes('title'),
    description: Joi.string().allow(null).notes('description')
  })
);

const response = Joi.alternatives().try(
  Joi.object()
);

module.exports = {
  response:response,
  payload: payload
};
