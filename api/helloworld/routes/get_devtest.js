'use strict';

module.exports = {
  method: 'GET',
  path: '/devtest',
  config: {
    description: 'for "core-depoly" testing',
    notes: 'for "core-depoly" testing',
    tags: ['dev'],
    auth: false
  },
  handler: (request, reply) => {
    reply('Server Alive!');
  }
};
