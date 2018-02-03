'use strict';
const message = require('./message');

/*  Message List 
500 system_db_bad_query
500 system_db_operation_failed
500 system_db_delete_key_empty
554 system_email_delivery_failed
401 system_invalid_token
400 system_db_dup_entry
403 system_forbidden
404 system_not_found

400 core_citizen_forbidden_handle
400 core_citizen_email_in_used
400 core_citizen_handle_in_used
400 core_citizen_email_not_verified
400 core_citizen_login_failed 草民代號、Email或密碼錯誤
*/

/**
  * Handle error messages
  * @param {object} err - The error object.
  *   @param {number} err.code - Error code number.
  *   @param {string} err.msg - Error message.
  * @param {object} reply - Hapi reply object.
  */
const handle = (err,reply) => {
  switch (err.code) {
  case 204:
    message.MsgNoContent(reply);
    break;
  case 404:
    message.ErrorObjectNotFound(reply);
    break;
  case 400:
    message.ErrorCustomBadRequest(err.msg, reply);
    break;
  case 500:
    message.ErrorBadImplementation(err.msg, reply);
    break;
  default:
    message.ErrorBadImplementation('system_db_operation_failed',reply);
  }
};

module.exports = {
  handle: handle
};
