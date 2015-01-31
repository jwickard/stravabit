var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Activity = new Schema({
    userId: { type: String, required: true },
    activityId: { type: String, required: true},
    name: { type: String, required: true },
    synchedAt: { type: Number, required: true },
    activityDate: { type: Number, required: true }
});

module.exports = mongoose.model('Activity', Activity);