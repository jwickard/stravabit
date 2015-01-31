var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = new Schema({
    name: { type: String, required: true },
    lastSynchedAt: { type: Number, required: false}
});

module.exports = mongoose.model('User', User);