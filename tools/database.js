'use strict';
const config = require('config');
const mysql = require('mysql');
const log = require('./log');

/**
  * Execute statements return data with callback
  * @param {String} queryStr - The query string.
  * @param {callback} callback - the callback object.
  */
const execute = (queryStr, callback) => {

  if (queryStr == '' || queryStr == null || queryStr == undefined){
    callback({code:500,msg:'system_db_bad_query'});
  }
  else {
    let connection = initiate();
    connection.query(queryStr, (error, results) => {
      if (error) {
        terminate(connection);
        log.error(error);
        if (error.code == 'ER_DUP_ENTRY'){
          callback({code:400,msg:'system_db_dup_entry'});
        }
        else {
          callback({code:500,msg:'system_db_bad_query'});
        }
      }
      else {
        callback(null, results);
      }

    }); 
    terminate(connection);
  }
};

const executeReturnSum = (queryStr, callback) => {
  
  if (queryStr == '' || queryStr == null || queryStr == undefined){
    callback({code:500,msg:'system_db_bad_query'});
  }
  else {
    let connection = initiate();
    connection.query(queryStr, (error, results) => {
      if (error) {
        terminate(connection);
        log.error(error);
        if (error.code == 'ER_DUP_ENTRY'){
          callback({code:400,msg:'system_db_dup_entry'});
        }
        else {
          callback({code:500,msg:'system_db_bad_query'});
        }
      }
      else {
        connection.query('SELECT FOUND_ROWS() sum', (error, results_sum) => {
          if (error) {
            terminate(connection);
            callback({code:500,msg:'system_db_bad_query'});
          }
          else {
            callback(null, results, results_sum);
          }
        });
        terminate(connection);
      }

    }); 
  }
};



const initiate = () => {
  let connection = mysql.createConnection({
    host     : config.db.host,
    user     : config.db.user,
    password : config.db.password,
    database : config.db.database
  });

  connection.connect();
  return connection;
};

const terminate = (connection) => {
  connection.end();
};

module.exports = {
  initiate: initiate,
  terminate: terminate,
  execute:execute,
  executeReturnSum:executeReturnSum
};
