'use strict';

module.exports = {
  method: 'GET',
  path: '/helloworld',
  config: {
    description: 'Say hello!',
    notes: 'The user parameter defaults to \'stranger\' if unspecified',
    tags: ['auth','dev'],
    auth: 'jwt'
  },
  handler: (request, reply) => {
    reply('Hello!').header('Authorization', request.headers.authorization);
  }
};
