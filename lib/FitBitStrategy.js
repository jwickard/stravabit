var FitbitStrategy = require('passport-fitbit').Strategy;
var User = require('../models/User');
var Authentication = require('../models/Authentication');
var OauthUtils = require('./OauthUtils')(User, Authentication);

module.exports = function (session) {
    var mod = {};

    mod.Strategy = new FitbitStrategy({
        consumerKey: process.env.FITBIT_CONSUMER_KEY,
        consumerSecret: process.env.FITBIT_CONSUMER_SECRET,
        callbackURL: process.env.FITBIT_CALLBACK
    }, function (token, tokenSecret, params, profile, done) {
        OauthUtils.handleOauthCallback(profile, token, tokenSecret).then(
            function (user) {
                session.userId = user.id;
                done(null, user);
            },
            function(err) {
                done(err, null);
            }
        );
    });

    mod.oauth = mod.Strategy._oauth;

    return mod;
};