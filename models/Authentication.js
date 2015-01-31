var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Authentication = new Schema({
    oauthId: { type: String, required: true },
    provider: { type: String, required: true },
    token: { type: String, required: true },
    tokenSecret: { type: String, required: false },
    expires: { type: Number, required: false },
    userId: { type: String, required: true },
    last_run: { type: Number, required: false }
});

module.exports = mongoose.model('Authentication', Authentication);