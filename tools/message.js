'use strict';

const boom = require('boom');
const config = require('config');
const ErrorBadImplementation = (msg, reply) => {reply(boom.badImplementation(msg));};
const ErrorCustomBadRequest= (msg, reply) => {reply(boom.badRequest(msg));};
const ErrorForbidden = (reply) => {reply(boom.forbidden('system_forbidden'));};
const ErrorSendEmailFailed = (email, reply) => {
  let errormsg = {
    statusCode : 554,
    message: 'system_email_delivery_failed',
    email: email
  };
  reply(errormsg).code(554);
};
const ErrorObjectNotFound = (reply) => {reply(boom.notFound('system_not_found'));};
const ErrorPasswordWrong = (reply) => {reply(boom.badRequest('密碼錯誤'));};
const ErrorInvalidToken = (reply) => {
  let errormsg = {
    statusCode : 401,
    message: 'system_invalid_token',
  };
  reply(errormsg).code(401);
};

const ErrorCitizenEmailNotVerified = (handle,emailID,reply) => {
  let errormsg = {
    statusCode : 401,
    message: 'core_citizen_email_not_verified',
    link: `${config.commons.serverURL}/citizen/${handle}/emails/${emailID}/request_verification`
  };
  reply(errormsg).code(401);
};



/*   =============== Message =============== */

const MsgOK = (reply) => {
  let msg = {
    message: 'OK'
  };
  reply(msg).code(200);
};

const MsgNoContent = (reply) => {
  reply().code(204);
};

const MsgObject = (Obj, reply) => {
  reply(Obj).code(200);
};


const MsgListArray =  (arrObj, pageObj ,reply) => {
  /*
    arrObj = {
      arr : [],
      totalRowCount : 0
    }
    pageObj = {
      paging : 2,
      pages : 3,
      previous : 1,
      next :3
    }
  */
  let msg = '';
  
  if (pageObj == null){
    msg = {
      rows: arrObj.arr,
      totalRowCount: arrObj.totalRowCount
    };
  }
  else {
    msg = {
      rows: arrObj.arr,
      totalRowCount: arrObj.totalRowCount,
      paging: {
        page: pageObj.paging,
        pages: pageObj.pages,
        pageSize: config.db.pageLimit,
        previous: pageObj.previous,
        next: pageObj.next,
      }
    };
  }
  reply(msg).code(200);
};

const MsgCitizenEmailAdded =  (emailID, reply) => {
  let msg = {
    message: '信箱新增成功',
    emailID: emailID
  };
  reply(msg).code(200);
};

const MsgCitizenEmailSetPrimary =  (reply) => {
  let msg = {
    message: '主要信箱更新成功',
  };
  reply(msg).code(200);
};

const MsgCitizenEamilVisibillty =  (res, reply) => {
  let msg = {
    visibility: res,
  };
  reply(msg).code(200);
};

const MsgGetCitizen = (citizen, reply) =>{
  let msg = {
    data:citizen
  };
  reply(msg).code(200);
};

const MsgLogin = (token, handle, role, reply) => {
  let msg = {
    token: token,
    handle: handle,
    roles: role
  };
  reply(msg).code(200);
};

const MsgChangePassword = (reply) => {
  let msg = {
    message: '密碼更新成功',
  };
  reply(msg).code(200);
};

const MsgEveryOne = (arr, reply) => {
  let msg = {
    data: arr
  };
  reply(msg).code(200);
};


module.exports = {
  ErrorBadImplementation:ErrorBadImplementation,
  ErrorCustomBadRequest:ErrorCustomBadRequest,
  ErrorPasswordWrong:ErrorPasswordWrong,
  ErrorForbidden:ErrorForbidden,
  ErrorSendEmailFailed:ErrorSendEmailFailed,
  ErrorCitizenEmailNotVerified:ErrorCitizenEmailNotVerified,
  ErrorInvalidToken:ErrorInvalidToken,
  ErrorObjectNotFound:ErrorObjectNotFound,

  MsgNoContent:MsgNoContent,
  MsgOK:MsgOK,
  MsgObject:MsgObject,
  MsgListArray:MsgListArray,
  MsgGetCitizen:MsgGetCitizen,
  MsgCitizenEmailAdded:MsgCitizenEmailAdded,
  MsgCitizenEmailSetPrimary:MsgCitizenEmailSetPrimary,
  MsgCitizenEamilVisibillty:MsgCitizenEamilVisibillty,
  MsgLogin:MsgLogin,
  MsgChangePassword:MsgChangePassword,
  MsgEveryOne:MsgEveryOne
};
