
class BaseController {
    constructor() {
      return this;
    }
    
    createHistory(req, historyInfo) {
      const history = {
        user: req.user ? req.user.id : '',
        ip: UtilityService.getIpAddress(req) || req.ip,
        impersonator: (req.user && req.user.impersonator) ? req.user.impersonator.id : undefined
      };
  
      Object.assign(history, historyInfo);
      vApp.eventEmitter.emit('USER_ACTION', history);
    }
  }
  
  module.exports = BaseController;
  