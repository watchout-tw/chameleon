'use strict';
const config = require('config');
const message = require('./message');

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

const checkDeleteResult = (results, reply) => {
  if ( results.affectedRows > 0){
    message.MsgNoContent(reply);
  }
  else {
    message.ErrorObjectNotFound(reply);
  }
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

module.exports = {
  getVisibillty:getVisibillty,
  getPages:getPages,
  rmNullItem:rmNullItem,
  rmNullarray:rmNullarray,
  nullToArray:nullToArray,
  handlePage:handlePage,
  handlePageURL:handlePageURL,
  parseJSON:parseJSON,
  parseStrArr:parseStrArr,
  parseStrArray:parseStrArray,
  parseStrArrayToCount:parseStrArrayToCount,
  checkDeleteResult:checkDeleteResult,
  arrayToString:arrayToString,
  checkArrayLength:checkArrayLength,
  arrayNullToEmpty:arrayNullToEmpty,
  nullToZero:nullToZero,
  diffArr:diffArr,
  nullCheck:nullCheck,
  rmRepeatItemInArr:rmRepeatItemInArr
};
