const jwt = require('jsonwebtoken');
const config = require('config');
const log = require('./log');
const message = require('./message');
const bouncer = require('./bouncer');

/**
  * decode JWT from request
  * @param {object} request - Http request object.
  * @param {boolen} bounce - The api required bouncer or not.
  * @param {object[]} role - The api role.
  * @param {object} controller - Controller object.
  * @param {object} reply - Hapi reply object.
  */
let decode = (request, bounce, role,controller, reply) => {
  jwt.verify(request.headers.authorization, config.privateKeys.login, (err, decoded) => {
    if (err) {
      log.message(err);
      message.ErrorInvalidToken(reply);
    }
    else {

      console.log('decoded :',decoded);

      let actionPayload = {
        decodedData: decoded,
        request: request,
        reply: reply
      };
      
      if (bounce) {
        bouncer.bounce(role, controller.action, actionPayload);
      } else {
        controller.action(actionPayload);
      }
      
    }
  });

};

module.exports = {
  decode:decode
};
