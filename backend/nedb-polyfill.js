const util = require('util');

if (typeof util.isDate !== 'function') {
  util.isDate = util.types.isDate || function(d) {
    return Object.prototype.toString.call(d) === '[object Date]';
  };
}

if (typeof util.isRegExp !== 'function') {
  util.isRegExp = util.types.isRegExp || function(re) {
    return Object.prototype.toString.call(re) === '[object RegExp]';
  };
}
