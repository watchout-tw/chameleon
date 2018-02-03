'use strict';
const database = require('../../../tools/database');
const message = require('../../../tools/message');

const action = (reply) => {
  let connection = database.initiate();
  let query = 'SELECT id, handle, nickname, character_id FROM Citizen';

  connection.query(query, (error, results) => {
    if (error) {
      database.terminate(connection);
      console.error(error);
      message.ErrorBadImplementation('system_db_bad_query',reply);
    }
    else {
      let keys = Object.keys(results[0]);
      let citizens = [];

      for (let i in results){
        let ctitzen = {};
        for (let j in keys){
          ctitzen[keys[j]] = results[i][keys[j]];
        }
        citizens.push(ctitzen);
      }
      message.MsgEveryOne(citizens, reply);
    }
  }); 
  database.terminate(connection);
};

module.exports = {
  action: action
};
