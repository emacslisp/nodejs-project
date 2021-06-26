/**
 * VocusONE API
 * @file Validation Service.
 * @created 11/03/2016
 * @author Rene Riveros <rene.riveros@vocus.co.nz>
 * @copyright Vocus Communications Ltd.
 */

'use strict';
let _ = require('underscore');
const moment = require('moment');
let bCrypt = require('bcrypt');

class ValidationService {
    validateRequest(req, criteria) {
        let inputData = {};

        for (let key in criteria) {
            inputData[key] = req.getField(key);
        }
        this.validateUserInput(criteria, inputData);
    }

    // Validate user input to make sure they pass in required
    validateUserInput(validateCriteria, inputData) {
        let self = this;

        // First cycle through the validate criteria
        let keys = Object.keys(validateCriteria);

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let criteria = validateCriteria[key];
            let value = inputData[key];

            // Is there criteria for this key?
            if (criteria) {
                // Does the value exist?
                if (!_.isNull(value) && !_.isUndefined(value)) {
                    // Value is defined

                    if (Array.isArray(criteria.type)) {
                        // check for OR condition
                        let err = [];

                        for (let typeToCheck of criteria.type) {
                            let error = self.validateType(typeToCheck, key, value);

                            if (error) err.push(error);
                        }
                        if (err.length === criteria.type.length) {
                            throw ErrorService.generateRequestValidationError(err.join(' \n '));
                        }
                    } else if (criteria.type && criteria.type.indexOf(',') > -1) {
                        // check for AND condition
                        const types = criteria.type.trim().split(',');

                        for (const typeToCheck of types) {
                            let error = self.validateType(typeToCheck.trim(), key, value);

                            if (error) throw ErrorService.generateRequestValidationError(error);
                        }
                    } else if (criteria.type) {
                        if (criteria.type === 'array[object]') {
                            let innerCriteria = Object.assign({}, criteria);

                            delete innerCriteria.type;
                            for (let obj of value) {
                                this.validateUserInput(innerCriteria, obj);
                            }
                        } else {
                            // Does it need to be a certain type of data?
                            // Types of type:
                            let error = self.validateType(criteria.type, key, value);

                            if (error) throw ErrorService.generateRequestValidationError(error);
                        }
                    }
                } else if (criteria.required) {
                    throw ErrorService.generateRequestValidationError(`Oops, ${key} is a compulsory field.`);
                }
            }
        }

        return true;
    }

    validateType(type, key, value) {
        let err;

        switch (type) {
            case 'salesForceId':
                err = this.validateSalesForceId(key, value);
                if (err) return err;
                break;
            case 'vocusId':
                err = this.validateVocusId(value);
                if (err) return err;
                break;
            case 'feasibilityId':
                err = this.validateFeasibilityId(key, value);
                if (err) return err;
                break;
            case 'ticketId':
                err = this.validateTicketId(key, value);
                if (err) return err;
                break;
            case 'quoteId':
                err = this.validateQuoteId(key, value);
                if (err) return err;
                break;
            case 'id':
                // Id can be integer or string
                if (!_.isNumber(value) && !_.isString(value)) {
                    return `Oops, ${key} must be an Integer Id.`;
                }
                break;
            case 'boolean':
                let boolVal = String(value).toLowerCase();
                // Id can be integer or string

                if (boolVal !== 'true' && boolVal !== 'false') {
                    return `Oops, ${key} must be an Boolean value.`;
                }
                break;
            case 'objectId':
                err = this.validateObjectId(key, value);

                if (err) return err;
                break;
            case 'object':
                if (!_.isObject(value) || (_.isArray(value) || _.isFunction(value))) {
                    return `Oops, ${key} must be valid JSON.`;
                }

                break;
            case 'billingSystem':
                if (!_.isString(value) ||
                    (_.isString(value) && ['stem7', 'smile', 'platypus'].indexOf(value.toLowerCase()) === -1)) {
                    return `Oops, ${key} must be valid billing system type (Stem7, Platypus or Smile).`;
                }
                break;
            case 'imageType':
                err = this.validateString(key, value);

                if (err) return err;
                if (!['image/png', 'image/jpg', 'image/jpeg', 'image/bmp'].includes(value)) return 'Must be a valid image type (image/png, image/jpg, image/jpeg, image/bmp)';
                break;
            case 'securePassword':
                err = this.validateString(key, value);

                if (err) return err;
                if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/.test(value)) {
                    return 'New password must contain at least 1 upper case letter, 1 lower case letter, 1 number and a minimal length of 8 characters.';
                }
                break;
            case 'string':
                err = this.validateString(key, value);

                if (err) return err;
                break;
            case 'date':
                err = this.validateDate(key, value);

                if (err) return err;
                break;
            case 'array':
                err = this.validateArray(key, value);

                if (err) return err;
                break;
            case 'array[string]':
                err = this.validateArray(key, value);
                if (err) return err;

                for (let j in value) {
                    err = this.validateString(key, value[j]);
                    if (err) break;
                }
                if (err) return err;
                break;
            case 'array[vocusId]':
                err = this.validateArray(key, value);

                if (err) return err;

                for (let j in value) {
                    err = this.validateVocusId(value[j]);
                    if (err) break;
                }
                if (err) return err;
                break;
            case 'array[objectId]':
                err = this.validateArray(key, value);

                if (err) return err;

                for (let j in value) {
                    err = this.validateObjectId(key, value[j]);
                    if (err) break;
                }
                if (err) return err;
                break;
            case 'array[salesForceId]':
                err = this.validateArray(key, value);

                if (err) return err;

                for (let j in value) {
                    err = this.validateSalesForceId(key, value[j]);
                    if (err) break;
                }
                if (err) return err;
                break;
            case 'locationEnquiry':
                let locationEnquiryList = ['near', 'joint', 'address', 'isdc', 'status', 'isnear', 'reference'];

                if (locationEnquiryList.indexOf(value) === -1) {
                    return `${value} is not valid location enquiry type`;
                }
                break;
            case 'bboxEnquiry':
                let bboxEnquiryList = ['near', 'net200', 'buildings'];

                if (bboxEnquiryList.indexOf(value) === -1) {
                    return ` ${value} is not valid bbox enquiry type`;
                }
                break;
            case 'doesnotequal':
                let keys = Object.keys(value);

                if (value[keys[0]] === value[keys[1]]) return `${keys[0]} cannot be the same as ${keys[1]}`;
                break;
            case 'isnotempty':
                if (!value || !value.length) return `${key} is required`;
                break;
            case 'invitationId':
                err = this.validateInvitationId(key, value);
                if (err) return err;
                break;
            case 'number':
                let parsed = parseInt(value);

                if (!value || (!parsed && parsed !== 0)) return `${key} data type is invalid`;
                break;
            case 'changeId':
                err = this.validateChangeId(value);
                if (err) return err;
                break;
        }
    }
    // Provide clean data for saving
    validInput(attrs, input) {
        if (input.constructor === Array) {
            let outputArray = [];

            for (let i = 0; i < input.length; i++) {
                let inputObject = input[i];
                let outputObject = {};

                attrs.forEach(function (param) {
                    let value = inputObject[param];

                    if ((typeof value !== 'undefined') && (value !== null)) {
                        outputObject[param] = value;
                    }
                });

                outputArray.push(outputObject);
            }
            return outputArray;
        } else {
            let inputObject = input;
            let outputObject = {};

            attrs.forEach(function (param) {
                let value = inputObject[param];

                if ((typeof value !== 'undefined') && (value !== null)) {
                    outputObject[param] = value;
                }
            });

            return outputObject;
        }
    }

    validateArray(key, value) {
        if (!_.isArray(value)) {
            return `Oops, ${key} must be an Array.`;
        }
    }

    validateString(key, value) {
        if (!_.isString(value) && !_.isNumber(value) && value) {
            return `Oops, ${key} must be a String.`;
        }
    }

    validateDate(key, value) {
        if (!moment(value, moment.ISO_8601, false).isValid()) {
            return `Oops, ${key} is not a valid date`;
        }
    }

    validateVocusId(value) {
        if (!_.isString(value) || value.length < 9 || value.indexOf('VCU') === -1) {
            return 'Oops, the Customer ID must be in the correct format VCUXXXXX.';
        }
    }

    validateChangeId(value) {
        if (!_.isString(value) || value.length < 9 || value.indexOf('CHG') === -1) {
            return 'Oops, the Change ID must be in the correct format CHGXXXXX.';
        }
    }

    validateFeasibilityId(key, value) {
        if (!_.isString(value) || value.length < 9 || value.indexOf('VFE') === -1) {
            return 'Oops, the Customer ID must be in the correct format VFEXXXXX.';
        }
    }

    validateTicketId(key, value) {
        if (!_.isString(value) || value.length < 6 || (value.indexOf('VTK') === -1 && value.indexOf('INC') === -1)) {
            return 'Oops, the ticket ID must be in the correct format VTKXXXXX or INCXXXX.';
        }
    }

    validateQuoteId(key, value) {
        if (!_.isString(value) || value.length < 9 || value.indexOf('VQU') !== 0) {
            return 'Oops, the Quote ID must be in the correct format VQUXXXXXX.';
        }
    }

    validateObjectId(key, value) {
        if (!vApp.mongoose.Types.ObjectId.isValid(value)) {
            return `Oops, ${key} must be a Mongo Object Id.`;
        }
    }

    validateSalesForceId(key, value) {
        let sfIdRegex = /^[a-zA-Z0-9]{18}$/;

        if (!_.isString(value) || !sfIdRegex.test(value)) {
            return `Oops, the Sales Force Id ${value} must be in the correct 18 character format.`;
        }
    }

    validateInvitationId(key, value) {
        if (!_.isString(value) || value.length < 9 || value.indexOf('VIU') === -1) {
            return 'Oops, the Invitation ID must be in the correct format VIUXXXXXX.';
        }
    }

    // Check for valid email address
    validateEmail(email) {
        let re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,10}(?:\.[a-z]{2})?)$/i;

        return re.test(email);
    }

    /**
     * validate ip address
     * @param {String} ip - ipv4 address
     * @returns {Boolean} - if ip is validate, it is true, otherwise it is false
     */
    validateIPAddress(ip) {
        let ipArray = ip.split('.');

        if (ipArray.length !== 4) {
            return false;
        }

        for (let ipAddress of ipArray) {
            let num = parseInt(ipAddress, 10);

            if (!(num >= 0 && num <= 255)) {
                return false;
            }
        }

        return true;
    }

    isVocusEmail(email) {
        let re = /@vocus/i;

        return re.test(email);
    }

    validatePassword(password, secret) {
        return new Promise(function (resolve, reject) {
            bCrypt.compare(password, secret, function (err, res) {
                if (err || !res) {
                    return resolve(false);
                } else {
                    return resolve(true);
                }
            });
        });
    }

    validatePhone(phone) {
        // Would match optional + and then any space and digit with the total of at least 7 digits
        let re = /^[+]{0,1}(?:\d\s*){7,}$/i;

        return re.test(phone);
    }

    validateCustName(name) {
        // Require at least 3 alpha numeric characters in the name
        let re = /(?:[a-zA-Z0-9]\W*){3,}/i;

        return re.test(name);
    }

    validateUsername(name) {
        return name.trim().length > 0;
    }

    escapeRegExp(keyword) {
        let regExpChar = /[\\^$.*+?()[\]{}|]/g;
        let regCharRegex = RegExp(regExpChar.source);

        return (keyword && regCharRegex.test(keyword))
            ? keyword.replace(regExpChar, '\\$&')
            : keyword;
    }

    userIsMemberOf(user, groups, condition) {
        let alloptions = groups.slice(0);
        let flag = '';
        let permissions = user.groups || user.permissions || [];

        if (!(groups instanceof Array)) {
            flag = permissions.indexOf(groups.toLowerCase()) >= 0;
            return flag;
        }

        for (let option in alloptions) {
            flag = permissions.indexOf(alloptions[option].toLowerCase()) >= 0;
            if (condition === 'and') {
                if (!flag) return flag;
            } else if (condition === 'or' || condition === undefined) {
                if (flag) return flag;
            }
        }
        return flag;
    }
}

module.exports = ValidationService;
