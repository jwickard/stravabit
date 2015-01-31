var FitbitStrategy = require('passport-fitbit').Strategy;
var debug = require('debug')('app:int');

module.exports = function (session, OauthUtils) {
    var mod = {};

    mod.verify = function(profile, token, tokenSecret, done){
        OauthUtils.handleOauthCallback(profile, token, tokenSecret).then(
            function (user) {
                debug('Setting session userId to ' + user.id);
                session.userId = user.id;
                done(null, user);
            },
            function(err) {
                done(err, null);
            }
        );
    };

    mod.Strategy = new FitbitStrategy({
        consumerKey: process.env.FITBIT_CONSUMER_KEY,
        consumerSecret: process.env.FITBIT_CONSUMER_SECRET,
        callbackURL: process.env.FITBIT_CALLBACK
    }, mod.verify);

    mod.oauth = mod.Strategy._oauth;

    return mod;
};