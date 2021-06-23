'use strict';

let Schema = vApp.mongoose.Schema;

let UserSchema = new Schema({
    name: {
        first: { type: String, default: '', required: 'First name is required', trim: true },
        last: { type: String, default: '', required: 'Last name is required', trim: true }
    },
    login: {
        username: { type: String, default: '', index: { unique: true }, required: 'User name is required', trim: true, lowercase: true },
        secret: { type: String, default: '' },
        hash: { type: String, default: '' },
        salt: { type: String, default: '' },
        last: { type: Date, default: Date.now },
        lastSeen: { type: Date, default: Date.now },
        count: { type: Number, default: 0 },
        online: { type: Boolean, default: false },
        isReset: { type: Boolean, default: false }
    },
    phone: { type: String, default: '' },
    mobile: { type: String, default: '' },
    email: { type: String, required: 'Email is required', trim: true },
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now },
    status: { type: String, enum: [ 'Created', 'Active', 'Archived' ], default: 'Created' },
    archived: { type: Boolean, default: false },
    timezone: { type: String, default: 'Australia/Sydney' }
});

UserSchema.pre('save', function (next) {

});

UserSchema.post('validate', function () {
    // SanitiseService.sanitiseModel(this);
});

module.exports = {
    schema: UserSchema,
    name: 'User',
    connection: 'main'
};