'use strict';
const Hapi = require('hapi');
const glob = require('glob');
const path = require('path');
const config = require('config');
const keyConf = config.get('privateKeys');
const server = new Hapi.Server();

// bring your own validation function
var validate = function (decoded, request, callback) {
  return callback(null, true);
};

server.connection({
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 8665), // accepting command line args
  routes: {
    cors: true
  }
});

server.register( // 幫 Hapi 新增 middleware
  [
    require('hapi-auth-jwt2'),
    require('vision'), // template rendering
    require('inert'), // static files
    require('lout') // api doc gen 
  ], (err) => {
  if (err) {
    throw (err);
  }

  server.auth.strategy('jwt', 'jwt',
    { key: keyConf.login,          // Never Share your secret key
      validateFunc: validate,            // validate function defined above
      verifyOptions: { algorithms: [ 'HS256' ], ignoreExpiration: true } // pick a strong algorithm
    });

  server.auth.default('jwt');
  /* Look through the routes in
    all the subdirectories of API
    and create a new route for each */
  glob.sync('api/**/routes/*.js', {
    root: __dirname
  }).forEach( file => {
    const route = require(path.join(__dirname, file));
    server.route(route);
  });
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
});
