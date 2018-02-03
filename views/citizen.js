'use strict';


const msg_citizen_verified = `
<p style="font-family:sans-serif;">
  Email認證成功，點選<a href="https://park.watchout.tw/?login" style="color:blue;text-decoration:none;">連結</a>登入沃草共有地。
</p>`;

const msg_verify_token_expired = (requestURL) => {
  return (`<p style="font-family:sans-serif;">認證失敗，點選<a href="${requestURL}" style="text-decoration:none;">連結</a>重發認證信</p>`);
};

module.exports = {
  msg_citizen_verified: msg_citizen_verified,
  msg_verify_token_expired:msg_verify_token_expired
};
