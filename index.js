'use strict';
const commons = require('./config/custom');
const mae = require('module-mae');

let config = mae.get_config();

// Auth server URL
config.auth = commons.auth;

// Other server URL
config.commons.serverURL = commons.serverURL;
config.commons['waaServerURL'] = commons.waaServerURL;


let configPath = './config/default.json';

const GO = () => {
  const app = require('./app');
  app.start();
};

mae.start(config,configPath,GO);
