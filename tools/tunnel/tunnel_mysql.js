'use strict';
const moment = require('moment');
const async = require('async');
const database = require('../database');

/**
  * compose SQL string for get multiple items 
  * @param {object} table - table object.
  *   @param {string} table.name - The target table name
  *   @param {object[]} table.indexes - The target table indexes
  *     @param {string} table.indexes[].name - name of index
  *     @param {any} table.indexes[].param - value 
  *     @param {string} table.indexes[].type - type of index
  *     @param {string} table.indexes[].match - 'exact' or 'partial'
  *   @param {object[]} table.keys - The target key object
  *     @param {string} table.keys[].name - name of key
  *     @param {string} table.keys[].type - type of key
  * @param {object[]} payload - The payload array
  * @param {object} callback - The callback object
  */
const get = (table, whereStr = '', pageStr = '', callback) => {
  let queryStr = composeSQLStringGet(table);
  queryStr += whereStr += pageStr;
  database.execute(queryStr, callback); 
};

/**
  * compose SQL string for adding multiple items 
  * @param {object} table - table object.
  *   @param {string} table.name - The target table name
  *   @param {object[]} table.indexes - The target table indexes
  *     @param {string} table.indexes[].name - name of index
  *     @param {any} table.indexes[].param - value 
  *     @param {string} table.indexes[].type - type of index
  *     @param {string} table.indexes[].match - 'exact' or 'partial'
  *   @param {object[]} table.keys - The target key object
  *     @param {string} table.keys[].name - name of key
  *     @param {string} table.keys[].type - type of key
  * @param {object[]} payload - The payload array
  * @param {object} callback - The callback object
  */
const post = (table, payload, callback) => {
  let queryStr = composeSQLStringPost(table, payload);
  database.execute(queryStr, callback);
};

/**
  * compose SQL string for adding multiple items 
  * @param {object} table - table object.
  *   @param {string} table.name - The target table name
  *   @param {object[]} table.indexes - The target table indexes
  *     @param {string} table.indexes[].name - name of index
  *     @param {any} table.indexes[].param - value 
  *     @param {string} table.indexes[].type - type of index
  *     @param {string} table.indexes[].match - 'exact' or 'partial'
  *   @param {object[]} table.keys - The target key object
  *     @param {string} table.keys[].name - name of key
  *     @param {string} table.keys[].type - type of key
  * @param {object[]} payload - The payload array
  * @param {object} callback - The callback object
  */
const patch = (table, payload, callback) => {
  if (Array.isArray(payload)) {
    async.map(payload, function (item,callback_ss) {
      for (let j in table.indexes) {
        table.indexes[j]['param'] = item[table.indexes[j].name];
        delete item[table.indexes[j].name];
      }

      let whereStr = composeSQLWhereString(table.indexes,true);
      if (whereStrCheck(whereStr)) {
        let queryStr = composeSQLStringPatch(table,item);
        queryStr += whereStr;
    
        if (whereStr.indexOf('undefined') > 0){
          callback_ss({code:400,msg:'`whereStr error : wrong index'},null);
        }
        else {
          database.execute(queryStr,callback_ss); 
        }
      }
      else {
        callback_ss({code:400,msg:`whereStr error : ${whereStr}`},null);
      }
      
    }, function (err,results) { 
      if (err) {
        callback(err);
      } 
      else {
  
        let count = 0;
        let err = false;
        for (let i in results) {
  
          if ( results[i]['affectedRows'] <= 0)
          {
            err = true;
          }
          else {
            count ++;
          }
          
        }
        if (err) {
          callback(null,{affectedRows:0});
        }
        else {
          callback(null,{affectedRows:count});
        }
      }
    });
  }
  else {
    callback({code:500,msg:'Payload shoud be array'});
  }

};

/**
  * compose SQL string for adding multiple items 
  * @param {object} table - table object.
  *   @param {string} table.name - The target table name
  *   @param {object[]} table.indexes - The target table indexes
  *     @param {string} table.indexes[].name - name of index
  *     @param {any} table.indexes[].param - value 
  *     @param {string} table.indexes[].type - type of index
  *     @param {string} table.indexes[].match - 'exact' or 'partial'
  *   @param {object[]} table.keys - The target key object
  *     @param {string} table.keys[].name - name of key
  *     @param {string} table.keys[].type - type of key
  * @param {object[]} payload - The payload array
  * @param {object} callback - The callback object
  */
const del = (table, payload, callback) => {

  async.map(payload, function (item,callback_ss) {
    let queryStr = composeSQLStringDel(table, item);
    database.execute(queryStr, callback_ss);      
  }, function (err,results) { 
    if (err) {
      callback(err);
    } 
    else {

      let count = 0;
      let err = false;
      for (let i in results) {

        if ( results[i]['affectedRows'] <= 0)
        {
          err = true;
        }
        else {
          count ++;
        }
        
      }
      if (err) {
        callback(null,{affectedRows:0});
      }
      else {
        callback(null,{affectedRows:count});
      }
    }
  });

};

/**
  * compose SQL string (custom)
  * @param {string} action - The action string of database (get,post,patch)
  * @param {object} query - The query string of database
  * @param {object} callback - The callback object
  * @param {boolean} ifSum - If return sum or not
  */
const custom = (action, query, callback, sum) => {
    
  let actionStr = '';
  let errmsg ='';
  switch (action){
  case 'GET':
    actionStr = 'GET';
    break;
  case 'POST':
    actionStr = 'POST';
    break;
  case 'PATCH':
    actionStr = 'PATCH';
    break;
  case 'DEL':
    actionStr = '';
    errmsg = {code:500,msg:'custom not support "DELETE" function'};
    break;
  default:
    actionStr = '';
    errmsg = {code:500,msg:`wrong_tunnel_action : <${actionStr}>`};
    break;
  }

  if (actionStr == ''){
    callback({code:500,msg:errmsg});
  }
  else {
    if (actionStr == 'GET' && sum) {
      database.executeReturnSum(query, callback);
    }
    else {
      database.execute(query, callback);
    }
  }
  
    
};

/**
  * compose SQL string for get multiple items 
  * @param {object} table - table object.
  *   @param {string} table.name - The target table name
  *   @param {object[]} table.indexes - The target table indexes
  *     @param {string} table.indexes[].name - name of index
  *     @param {any} table.indexes[].param - value 
  *     @param {string} table.indexes[].type - type of index
  *     @param {string} table.indexes[].match - 'exact' or 'partial'
  *   @param {object[]} table.keys - The target key object
  *     @param {string} table.keys[].name - name of key
  *     @param {string} table.keys[].type - type of key
  */
const composeSQLStringGet = (table) =>{
  
  let keyStr = '';
  let comma = false;

  for (let i in table.indexes) {
    if (comma){
      keyStr += ',';
    }
    else {
      comma = true;
    }
    keyStr += `\`${table.indexes[i].name}\``;
  }

  for (let j in table.keys) {

    if (table.keys[j].name !=='editor')
    {
      if (comma){
        keyStr += ',';
      }
      else {
        comma = true;
      }
      keyStr += `\`${table.keys[j].name}\``;
    }

  }
  
  return (`
    SELECT
      ${keyStr}  
    FROM
      ${table.name}
  `);
};

/**
  * compose SQL string for adding multiple items 
  * @param {object} table - table object.
  *   @param {string} table.name - The target table name
  *   @param {object[]} table.indexes - The target table indexes
  *     @param {string} table.indexes[].name - name of index
  *     @param {any} table.indexes[].param - value 
  *     @param {string} table.indexes[].type - type of index
  *     @param {string} table.indexes[].match - 'exact' or 'partial'
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
  * compose SQL string for adding multiple items 
  * @param {object} table - table object.
  *   @param {string} table.name - The target table name
  *   @param {object[]} table.indexes - The target table indexes
  *     @param {string} table.indexes[].name - name of index
  *     @param {any} table.indexes[].param - value 
  *     @param {string} table.indexes[].type - type of index
  *     @param {string} table.indexes[].match - 'exact' or 'partial'
  *   @param {object[]} table.keys - The target key object
  *     @param {string} table.keys[].name - name of key
  *     @param {string} table.keys[].type - type of key
  * @param {object[]} payload - The payload
  */
const composeSQLStringPatch = (table,payload) => {
  
  let keyArr = table.keys;

  let res = `UPDATE ${table.name} SET `;
  let d = false;
  for (let index in keyArr) {
    if ( payload.hasOwnProperty(keyArr[index]['name'])) {

      if (!d) {
        d = true;
      }
      else {
        res += ',';
      }
      res += ` \`${keyArr[index]['name']}\` = ${toSQLValue(keyArr[index], payload)}`;
    }
  }
  res += ' ';
  return (res);
};

/**
  * compose SQL string for adding multiple items 
  * @param {object} table - table object.
  *   @param {string} table.name - The target table name
  *   @param {object[]} table.indexes - The target table indexes
  *     @param {string} table.indexes[].name - name of index
  *     @param {any} table.indexes[].param - value 
  *     @param {string} table.indexes[].type - type of index
  *     @param {string} table.indexes[].match - 'exact' or 'partial'
  *   @param {object[]} table.keys - The target key object
  *     @param {string} table.keys[].name - name of key
  *     @param {string} table.keys[].type - type of key
  * @param {object[]} payload - The payload
  */
const composeSQLStringDel = (table,payload) =>{
    
  for (let j in table.indexes) {
    table.indexes[j]['param'] = payload[table.indexes[j].name];
  }
  let whereStr = composeSQLWhereString(table.indexes,true);
  if (whereStrCheck(whereStr)) {
    return (`DELETE FROM ${table.name} ${whereStr}`);
  }
  else {
    return false;
  }
};

/**
  * compose SQL where string
  * @param {object[]} obj - table object.
  *   @param {string} obj[].name - The target table name
  *   @param {any} obj[].param - The target table name
  *   @param {string} obj[].type - 'str','int','date'
  *   @param {string} obj[].match - 'exact','partial'
  * @param {boolean} where - Need add 'WHERE' string or not
  */
const composeSQLWhereString = (obj, where) => {
  // obj example = [{name:'R.id', param:params['id'], type:'string',match:'exact'} ]
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

      if (obj[index]['name'] == 'index') {
        whereStr += `\`${obj[index]['name']}\``;
      }
      else {
        whereStr += obj[index]['name'];
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

/**
  * compose SQL where string with group of IDs
  * @param {string} key - key name.
  * @param {arr[]} arr - array of ID.
  * @param {boolean} where - Need add 'WHERE' string or not
*/
const composeSQLWhereStringWithIDs = (key,arr,where) => {
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

const toSQLValue = (key, item) => {

  let val = item[key['name']];

  if (val == null || val == undefined) {
    val =   null;
  }
  else {
    switch (key['type']){
    case 'str':
      val = `"${val}"`;
      break;
    case 'date':
      val = `"${moment(val).format('YYYY-MM-DD HH-mm-ss')}"`;
      break;
    case 'arr_str':
      val = arrayToString(val,'str');
      break;
    case 'arr_int':
      val = arrayToString(val,'int');
      break;
    case 'json':
      val = `'${val}'`;
      break;
    default:
    }
  }
  return val;
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

const whereStrCheck = (whereStr) => {
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

const nullCheck = (item) => {
  if (item === null || item === undefined || item === '') {
    return false;
  }
  else {
    return true;
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


module.exports = {
  get: get,
  post: post,
  patch:patch,
  del: del,
  custom:custom,
  composeSQLWhereString:composeSQLWhereString,
  composeSQLWhereStringWithIDs:composeSQLWhereStringWithIDs,
  toSQLValue:toSQLValue
};
