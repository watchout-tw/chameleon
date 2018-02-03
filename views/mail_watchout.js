'use strict';


const title_join = '成為草民→沃草共有地←';

/**
  * Log errors
  * @param {object} err - error object.
  */
const getTextJoin = (url) => {
  return (`
  你好：\n\n
  
  歡迎加入沃草共有地，請點選下方認證連結，正式成為草民。\n\n
  
  認證連結：\n
  ${url}\n\n
  
  這封信是由沃草共有地機器人寄出，用以認證你的Email。\n
  當你收到這封信，請在兩天內點選上方連結，即可完成草民身分認證，無需回信。\n
  如果有任何問題，歡迎來信 helper@watchout.tw\n`);
};

module.exports = {
  title_join: title_join,
  getTextJoin:getTextJoin
};
