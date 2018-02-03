'use strict';
const message = require('./message');
const util = require('./util');
const async = require('async');

const bounce =  (arrRole, action, payload) => {

  arrRole.unshift({channel:'*',name:'god'});

  async.waterfall([
    function (callback) {
      let query = `
        SELECT 
          CR.citizen_id,
          CR.role_id,
          R.channel,
          R.name 
        FROM Citizen_Role CR,Role R
        WHERE CR.citizen_id = ${payload.decodedData.citizenID} AND R.id = CR.role_id;`;
      util.executeDBWithCallback(query, callback);
    },
    function (dbRole, callback) {
      
      let found = false;
      if (dbRole.length > 0) {
        for (let i in arrRole) {
          for (let j in dbRole) {
            if ( arrRole[i]['channel'] ==  dbRole[j]['channel'] &&
                 arrRole[i]['name'] ==  dbRole[j]['name']  ) {

              found = true;
            }

            if (found) {
              break;
            }
          }
          if (found) {
            break;
          }
        }
      }
      callback(null, found);
    }
  ], function (err, res) {
    if (err) {
      message.ErrorForbidden(payload['reply']);
    }
    else {
      if (res) {
        action(payload);
      }
      else {
        message.ErrorForbidden(payload['reply']);
      }
    }
  });

};

module.exports = {
  bounce: bounce
};
