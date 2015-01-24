mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/stravabit');

var Schema = mongoose.Schema;

var UserModel = mongoose.model('User', new Schema({
    name: { type: String, required: true },
    lastSynchedAt: { type: Number, required: false}
}));

var AuthModel = mongoose.model('Authentication', new Schema({
    oauthId: { type: String, required: true },
    provider: { type: String, required: true },
    token: { type: String, required: true },
    tokenSecret: { type: String, required: false },
    expires: { type: Number, required: false },
    userId: { type: String, required: true },
    last_run: { type: Number, required: false }
}));

var ActivityModel = mongoose.model('Activity', new Schema({
    userId: { type: String, required: true },
    activityId: { type: String, required: true},
    name: { type: String, required: true },
    synchedAt: { type: Number, required: true },
    activityDate: { type: Number, required: true }
}));

exports.AuthModel = AuthModel;
exports.UserModel = UserModel;
exports.ActivityModel = ActivityModel;