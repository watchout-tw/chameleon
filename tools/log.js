'use strict';

/**
  * Log messages
  * @param {string} msg - log message.
  */
const message = (msg) => {
  console.log(msg);
};

/**
  * Log errors
  * @param {object} err - error object.
  */
const error = (err) => {
  console.error(err);
};

module.exports = {
  message: message,
  error:error
};
