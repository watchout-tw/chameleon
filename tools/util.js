'use strict';
const config = require('config');
//const async = require('async');
const message = require('./message');
const database = require('./database');
const log = require('./log');
const moment = require('moment');

const getVisibillty = (value) => {
  switch (value)
  {
  case 0:
    return ('private');
  case 1:
    return ('public');
  }
  
};

const getPages = (sum) => {

  if ( sum <= 0) {
    return 0;
  }
  else {
    return (Math.ceil(sum / config.db.pageLimit));
  }
};

const getWhereStr = (obj, where) => {
  // obj example = [{key:'R.id', param:params['id'], type:'string',match:'exact'} ]
  // where option : add "where" string or not
  let whereStr ='';
  
  let flag = false;
  for (let index in obj){
    if (obj[index]['param'] !== undefined) {

      if (where == true && !flag){
        whereStr += ' WHERE ';
        flag = true;
      }
      else {
        whereStr += ' AND '; 
      }

      if (obj[index]['key'] == 'index') {
        whereStr += `\`${obj[index]['key']}\``;
      }
      else {
        whereStr += obj[index]['key'];
      }

      if ( obj[index]['type'] == 'str') {
        if ( obj[index]['match'] == 'partial') {
          whereStr += ` like "%${obj[index]['param']}%"`;
        }
        else {
          whereStr += '="' + obj[index]['param'] +'"';
        }
      }
      else if ( obj[index]['type'] == 'date') {

        let objDate = {date: obj[index]['param']};

        whereStr += '=' + toSQLValue({ name:'date', type:'date'},objDate);
      }
      else {
        whereStr += '=' + obj[index]['param'];
      }
      
    }
  }
  return whereStr;
};

const whereStrOrIDs = (where,key,arr) => {
  let output = '';

  if (checkArrayLength(arr) >0) {
    for (let i in arr){
      if (i == 0) {
        if (where){
          output += 'WHERE (';
        }
        else {
          output += 'AND (';
        }
      }
      else {
        output += ' OR ';
      }
      output += `${key}=${arr[i]}`;
    }
    output += ')';
  }
  return output;
};

const rmNullItem = (results, Key) => {
  let arr = [];
  for (let index in results){
    if (results[index][Key] !== null) {
      arr.push(results[index]);
    }
  }
  return arr;
};

const rmNullarray = (results,tarobj) => {

  for (let index in results) {
    if (results[index][tarobj].length == 1 ) {
      let objkey = Object.keys(results[index][tarobj][0]);
      let empty = true;
      for (let j in objkey) {
        if ( results[index][tarobj][0][objkey[j]]  != null) {
          empty = false;
        }
      }
      
      if (empty) {
        results[index][tarobj] = [];
      }
    }
  }
  return results;
};

const nullToArray  = (results,tarobj) => {

  for (let index in results) {
    if (results[index][tarobj] == null ) {
      results[index][tarobj] = [];
    }
  }
  return results;
};

const handlePage = (params) => {

  let res = {
    pageAll: false,
    params: null,
    keysParams: null,
    paging:0,
    pageStr:''
  };
  let paging = 0;
  let keysParams = Object.keys(params);
  let pageIndex = keysParams.indexOf('page');
  let pageAll = keysParams.indexOf('all');

  if ( pageAll > -1){
    keysParams.splice(pageAll, 1);
    res.pageAll = true;
  }
  else {
    if (pageIndex > -1){
      paging = parseInt(params.page);
      paging -= 1;
      if (paging <= 0 ) {
        paging = 0;
      }
      keysParams.splice(pageIndex, 1);
      delete params['page'];
    }

    res.pageStr = ' LIMIT ' + config.db.pageLimit + 
              ' OFFSET ' + paging * config.db.pageLimit;
  }
  res.params = params;
  res.keysParams = keysParams;
  res.paging = paging;
  return res;
};

const handlePageURL = (params, apiRoute, resLength, pages, paging) => {
  let previous = null;
  let next = null;
  let current = 1;
  let res = {
    paging: 1,
    pages : pages,
    previous: null,
    next: null
  };
  if ( pages <= 0 && paging <= 1) {
    previous = null;
    next = null;
  }
  else {
    if (paging == 0 && resLength < config.db.pageLimit){
      // while only 1 page
      current = pages;
      previous = null;
      next = null;
    }
    // while current page is the first page
    else if (paging < 1 && resLength >= config.db.pageLimit) {
      current = 1;
      previous = null;
      next = 2;
    }
    else if (pages == (paging+1)){
      // while current page is the last page
      current = pages;
      previous = pages -1;
      next = null;
    }
    else if (paging >= pages ){
      // while current page is out of page
      current = pages;
      previous = pages;
      next = null;
    }
    else {
      // while current page is in the middle of pages
      previous = paging;
      current = paging +1;
      next = paging + 2;
    }
  }

  let filters = '';
  let filterKeys = Object.keys(params);
  for (let index in filterKeys){
    filters += '&' + filterKeys[index] + '=' + params[filterKeys[index]];
  }

  if (previous !== null) {
    res.previous = config.commons.serverURL + apiRoute + previous + filters;
  }
  if (next !== null) {
    res.next = config.commons.serverURL + apiRoute+ next + filters;
  }
  res.paging = current;
  
  return res;
};


const parseJSON = (arr, results) => {
  if (results.length > 0){
    for (let i in results){
      for (let j in arr){
        if ( results[i].hasOwnProperty(arr[j])) {
          results[i][arr[j]] = JSON.parse(results[i][arr[j]]);
          // level 2 JSON array
          for (let k in results[i][arr[j]]) {
            for (let m in arr) {
              if ( results[i][arr[j]][k] !== null) {
                if ( results[i][arr[j]][k].hasOwnProperty(arr[m])) {
                  results[i][arr[j]][k][arr[m]] =  JSON.parse(results[i][arr[j]][k][arr[m]]);
                }
              }
            }
          }
        }
      }
    }
  }
  return results;
};


const parseStrArr = (str) => {
  let out = [];
  while (str !== null ) {

    str = str.split(',');
    out.push(str[0]);
    if (str.length > 1){
      str = str[1];
    }
    else {
      str = null;
    }
  }
  return out;
};


const parseStrArray = (arr, results) => {
  if (results.length > 0){
    for (let i in results){
      for (let j in arr){
        if ( results[i].hasOwnProperty(arr[j])) {
          if ( results[i][arr[j]] !== null) {
            results[i][arr[j]] = results[i][arr[j]].split(',');
          }
          else {
            results[i][arr[j]] = [];
          }
        }
      }
    }
  }
  return results;
};


const parseStrArrayToCount = (arr, results) => {
  if (results.length > 0){
    for (let i in results){
      for (let j in arr){
        if ( results[i].hasOwnProperty(arr[j])) {
          if ( results[i][arr[j]] !== null) {
            results[i][arr[j]] = (results[i][arr[j]].split(',')).length;
          }
          else {
            results[i][arr[j]] = 0;
          }
        }
      }
    }
  }
  return results;
};

const checkDBError = (error, reply) =>{

  if (error.code == 'ER_DUP_ENTRY'){
    message.ErrorCustomBadRequest('system_db_dup_entry',reply);
  }
  else {
    message.ErrorBadImplementation('system_db_bad_query',reply);
  }

};

const checkDeleteResult = (results, reply) => {
  if ( results.affectedRows > 0){
    message.MsgNoContent(reply);
  }
  else {
    message.ErrorObjectNotFound(reply);
  }
};

/**
  * compose SQL string for adding multiple items 
  * @param {object} table - table object.
  *   @param {string} table.name - The target table name
  *   @param {object[]} table.keys - The target key object
  *     @param {string} table.keys[].name - name of key
  *     @param {string} table.keys[].type - type of key
  * @param {object[]} payload - The payload
  */
const composeSQLStringPost = (table,payload) =>{

  let keyStr = '(';
  for (let k in table['keys']) {
    if ( k != 0 ) {
      keyStr += ',';
    }
    keyStr += `\`${table['keys'][k]['name']}\``;

  }
  keyStr += ')';
  
  let itemStr = '';
  
  for (let i in payload) {
    if ( i != 0 ) {
      itemStr += ',';
    }
    itemStr += '(';

    for (let j in table['keys']) {

      if ( j != 0 ) {
        itemStr += ',';
      }

      itemStr += toSQLValue(
        {
          name: table['keys'][j]['name'],
          type: table['keys'][j]['type']
        },
        payload[i]
      );
    }


    itemStr += ')';
  }
  
  return (`
    INSERT INTO
      ${table.name}
      ${keyStr}  
    VALUES
      ${itemStr}
  `);
};

/**
  * compose SQL string for update database 
  * @param {object} table - table object.
  *   @param {string} table.name - The target table name
  *   @param {object[]} table.keys - The target key object
  *     @param {string} table.keys[].name - name of key
  *     @param {string} table.keys[].type - type of key
  * @param {object} payload - The payload
  * @param {string} whereStr - whereStr of the target
  */
const composeSQLStringPatch = (table,payload,whereStr) => {

  let keyArr = table.keys;

  let res = `UPDATE ${table.name} SET `;
  let d ='';
  
  for (let index in keyArr) {

    if (index != 0) {
      res += ',';
    }
    if ( payload.hasOwnProperty(keyArr[index]['name'])) {
      res += `${d} \`${keyArr[index]['name']}\` = ${toSQLValue(keyArr[index], payload)}`;
    }

  }
  res += ' ';
  res += whereStr;
  return (res);
};

const composeSQLSelectItem = (items) =>{

  let res = '';
  for (let i in items) {
    if (i == 0){
      res += items[i];
    }
    else {
      res += ', ' + items[i];
    }
    
  }
  return res;
};


/**
  * compose SQL insert string
  * @param {string[]} keys - Payload keys.
  * @param {object[]} items - Payload array.
  */
const composeSQLInsertItem = (keys,items) =>{  
  let res = '';
  for (let i in items) {
    res += '(';
    if ( i !== 0 ){
      res += ',';
    }

    for (let j in keys) {
      if ( j !== 0 ){
        res += ',';
      }
      res += items[i][j];

    }
    res += ')';
  }
  return res;
};


const getSQLPostItemArray = (editor, key, keys, payload) => {

  let arr = [];

  for (let index in payload) {
    let arr_item = [];

    if (editor !== null) {
      arr_item.push(editor);
    }
    arr_item.push(key);

    for (let k in keys) {
      if (payload[index].hasOwnProperty(keys[k])) {
        arr_item.push(payload[index][keys[k]]);
      }
      else {
        arr_item.push(null);
      }
    }
    arr.push(arr_item);
  }
  return arr;
};

const arrayToString = (arr,itemType) => {

  let res = '';
  let d ='';
  if (arr.length >0) {
    res += '\'[';
    for (let i in arr ) {

      if (i == 0) {
        d = '';
      }
      else {
        d = ',';
      }

      if (itemType =='str') {
        res += d +'"' + arr[i] + '"';
      }
      else if (itemType =='obj') {

        let objkeys = Object.keys(arr[i]);
        res += d +'{';
        for (let j in objkeys) {
          
          let d_ = '';

          if (j == 0) {
            d_ = '';
          }
          else {
            d_ = ',';
          }

          if (typeof arr[i][objkeys[j]] === 'string') {
            res += d_ +'"' + objkeys[j] + '":"' + arr[i][objkeys[j]] + '"';
          }
          else {
            res += d_ +'"' + objkeys[j] + '":' + arr[i][objkeys[j]] ;
          }
        }
        res += '}';
      }
      else {
        res +=  d + arr[i];
      }
      
    }
    res += ']\''; 
  }
  else {
    return '\'[]\'';
  }
  return res;
};

const postSQLString = (table, editor, keyArr, payload) => {
  let keys = '';
  let values = '';
  let d ='';
  let keyeditor = 'editor';
  if (editor == null) {
    keyeditor = '';
    values += '(';
  }
  else {
    values += '(' + editor;
  }

  keys += 'INSERT INTO ' + table + ' (' + keyeditor;
  
  for (let index in keyArr) {

    if (editor == null) {
      if (index == 0) {
        d = '';
      }
      else {
        d = ',';
      }
    }
    else {
      d = ',';
    }

    if (keyArr[index]['name'] == 'index') {
      keys += d + '`' + keyArr[index]['name'] + '`';
    }
    else {
      keys += d + keyArr[index]['name'];
    }
    if ( payload.hasOwnProperty(keyArr[index]['name'])) {
      values += d + toSQLValue(keyArr[index], payload);
    }
    else {
      values += d + null;
    }
  }
  keys += ') VALUES ';
  values += ')';

  return keys + values;

};



const replaseSQLString = (table, editor, keyArr, payload) => {

  let res = `REPLACE ${table} SET `;
  let d ='';
 
  if (editor !== null) {
    res += `editor = ${editor}`;
  }
  for (let index in keyArr) {

    if (editor == null) {
      if (index == 0) {
        d = '';
      }
      else {
        d = ',';
      }
    }
    else {
      d = ',';
    }

    if ( payload.hasOwnProperty(keyArr[index]['name'])) {
      if (keyArr[index]['name'] == 'index') {
        res += `${d} \`index\` =  ${toSQLValue(keyArr[index], payload)}`;
      }
      else {
        res += `${d} ${keyArr[index]['name']} = ${toSQLValue(keyArr[index], payload)}`;
      }

     
    }

  }
  return (res);
};

const deleteSQLString = (table, whereStr) => {
  return (`DELETE FROM ${table} ${whereStr}`);
};


const toSQLValue = (key, item) => {

  let val = item[key['name']];
  if (key['type'] == 'str' ) {

    if (val == null) {
      return  val;
    }
    else {
      return (`"${val}"`);
    }
  }
  else if (key['type'] == 'date') {
    if (val == null) {
      return null;
    }
    else {
      return (`"${moment(val).format('YYYY-MM-DD HH-mm-ss')}"`);
    }
  }
  else if (key['type'] == 'arr_str' ){
    return ( arrayToString(val,'str'));
  }
  else if (key['type'] == 'arr_int' ){
    return ( arrayToString(val,'int'));
  }
  else if (key['type'] == 'json' ){
    return (`'${val}'`);
  }
  else {
    return  val;
  }
};

const executeDBCountRows = (Table, callback) => {

  if (Table == '' || Table == null || Table == undefined){
    callback({code:500,msg:'system_db_bad_query'});
  }
  else {
    let connection = database.initiate();
    connection.query(`SELECT COUNT(*) sum FROM ${Table}`, (error, results) => {
      if (error) {
        database.terminate(connection);
        log.error(error);
        callback({code:500,msg:'system_db_bad_query'});
      }
      else {
        callback(null, results);
      }

    }); 
    database.terminate(connection);
  }
};

const executeDBWithSumCallback = (queryStr, callback) => {

  if (queryStr == '' || queryStr == null || queryStr == undefined){
    callback({code:500,msg:'system_db_bad_query'});
  }
  else {
    let connection = database.initiate();
    connection.query(queryStr, (error, results) => {
      if (error) {
        database.terminate(connection);
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
            database.terminate(connection);
            callback({code:500,msg:'system_db_bad_query'});
          }
          else {
            callback(null, results, results_sum);
          }
        });
        database.terminate(connection);
      }

    }); 
  }
};

const executeDBWithCallback = (queryStr, callback) => {

  if (queryStr == '' || queryStr == null || queryStr == undefined){
    callback({code:500,msg:'system_db_bad_query'});
  }
  else {
    let connection = database.initiate();
    connection.query(queryStr, (error, results) => {
      if (error) {
        database.terminate(connection);
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
    database.terminate(connection);
  }
};

const executeDBWithPayloadCallback = (queryStr, payload, callback) => {

  if (  queryStr == '' || queryStr == null || queryStr == undefined ||
        payload == '' || payload == null || payload == undefined) {
    callback({code:500,msg:'system_db_bad_query'});
  }
  else {
    let connection = database.initiate();
    connection.query(queryStr, payload, (error, results) => {
      if (error) {
        database.terminate(connection);
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
    database.terminate(connection);
  }
};

const checkArrayLength = (arr) => {
  if (arr == null || arr == undefined ) {
    return 0;
  }
  else {
    return (arr.length);
  }
};

const arrayNullToEmpty = (arr) => {
  if (arr == null || arr == undefined ) {
    return [];
  }
  else {
    return arr;
  }
};

const nullToZero = (tar) => {
  if (tar == null || tar == undefined ) {
    return 0;
  }
  else {
    return tar;
  }
};

/**
  * diff Arr
  * @param {object} input - input object.
  *   @param {object[]} input.curr - The target table name
  *   @param {object[]} input.next - next object array
  *   @param {string[]} input.keys - keys to diff
  */
const diffArr = (input) => {

  let output = {
    toAdd: [],
    toPatch: [],
    toDelete:[]
  };

  for (let i in input.next) {
    let find = false;
    for (let j in input.curr) {   
      let check_key = true; 

      for (let m in input.keys) {

        if (typeof input.curr[j][input.keys[m]] === 'object') {
          if (input.curr[j][input.keys[m]].getTime() !== input.next[i][input.keys[m]].getTime()) {
            check_key = false;
          }
        }
        else {
          if (input.curr[j][input.keys[m]] !== input.next[i][input.keys[m]]) {
            check_key = false;
          }
        }
      }
      if (check_key) {
        find = true;
      }
    }
    if (find) {
      output.toPatch.push(input.next[i]);            
    }
    else {
      output.toAdd.push(input.next[i]); 
    }
    
  } 
 
  for (let i in input.curr) {
    let find = false;
    for (let j in input.next) {   
      let check_key = true; 

      for (let m in input.keys) {

        if (typeof input.next[j][input.keys[m]] === 'object') {
          if (input.curr[i][input.keys[m]].getTime() !== input.next[j][input.keys[m]].getTime()) {
            check_key = false;
          }
        }
        else {
          if (input.curr[i][input.keys[m]] !== input.next[j][input.keys[m]]) {
            check_key = false;
          }
        }
      }
      if (check_key) {
        find = true;
      }
    }
    if (!find) {
      output.toDelete.push(input.curr[i]);        
    }
    
  } 
  return output;
};

const nullCheck = (item) => {
  if (item === null || item === undefined || item === '') {
    return false;
  }
  else {
    return true;
  }
};

const rmRepeatItemInArr = (arr) => {
  let result= arr.filter((element, index, arr) => {
    return arr.indexOf(element)=== index;
  });
  return result;
};

const DBDeleteWhereStrCheck = (whereStr) => {
  if ( !nullCheck(whereStr) ) {
    return false;
  }
  else {
    if (  (whereStr.indexOf('WHERE') < 0 && whereStr.indexOf('where') < 0 )||
          whereStr.indexOf('=') < 0 ||
          whereStr.length <= 0) {
      return false;
    }
    else {
      return true;
    }
  }
};

module.exports = {
  getVisibillty:getVisibillty,
  getPages:getPages,
  getWhereStr:getWhereStr,
  whereStrOrIDs:whereStrOrIDs,
  rmNullItem:rmNullItem,
  rmNullarray:rmNullarray,
  nullToArray:nullToArray,
  handlePage:handlePage,
  handlePageURL:handlePageURL,
  parseJSON:parseJSON,
  parseStrArr:parseStrArr,
  parseStrArray:parseStrArray,
  parseStrArrayToCount:parseStrArrayToCount,
  checkDBError:checkDBError,
  checkDeleteResult:checkDeleteResult,
  composeSQLStringPost:composeSQLStringPost,
  composeSQLSelectItem:composeSQLSelectItem,
  composeSQLInsertItem:composeSQLInsertItem,
  getSQLPostItemArray:getSQLPostItemArray,
  arrayToString:arrayToString,
  toSQLValue:toSQLValue,
  postSQLString:postSQLString,
  composeSQLStringPatch:composeSQLStringPatch,
  replaseSQLString:replaseSQLString,
  deleteSQLString:deleteSQLString,
  executeDBCountRows:executeDBCountRows,
  executeDBWithSumCallback:executeDBWithSumCallback,
  executeDBWithCallback:executeDBWithCallback,
  executeDBWithPayloadCallback:executeDBWithPayloadCallback,
  checkArrayLength:checkArrayLength,
  arrayNullToEmpty:arrayNullToEmpty,
  nullToZero:nullToZero,
  diffArr:diffArr,
  nullCheck:nullCheck,
  rmRepeatItemInArr:rmRepeatItemInArr,
  DBDeleteWhereStrCheck:DBDeleteWhereStrCheck,
};
