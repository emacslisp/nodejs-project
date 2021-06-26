'use strict';

let crypto = require('crypto');

class UtilityService {
  deepMerge(target, ...sources) {
    let self = this;

    if (!sources.length) return target;
    const source = sources.shift();

    if (self.isObject(target) && self.isObject(source)) {
      for (const key in source) {
        if (self.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          self.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return self.deepMerge(target, ...sources);
  }

  isObject(item) {
    return (item && item.constructor === Object && !Array.isArray(item));
  }

  getIpAddress(req) {
    return req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0] || req.connection.remoteAddress;
  }

  md5(data) {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  generateHash(password, salt) {
    return crypto.createHmac('sha256', salt).update(password).digest('hex');
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }
}

module.exports = UtilityService;