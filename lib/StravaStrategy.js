var StravaStrategy = require('passport-strava').Strategy;
var User = require('../models/User');
var Authentication = require('../models/Authentication');
var OauthUtils = require('./OauthUtils')(User, Authentication);

module.exports = function (session) {
    var mod = {};

    mod.Strategy = new StravaStrategy({
            consumerKey: process.env.STRAVA_CONSUMER_KEY,
            clientSecret: process.env.STRAVA_CLIENT_SECRET,
            clientID: process.env.STRAVA_CLIENT_ID,
            callbackURL: process.env.STRAVA_CALLBACK
        }, function(accessToken, refreshToken, params, profile, done){
            OauthUtils.handleOauthCallback(profile, accessToken, null).then(
                function (user) {
                    session.userId = user.id;
                    done(null, user);
                },
                function(err) {
                    done(err, null);
                }
            );
        }
    );

    mod.oauth = mod.Strategy._oauth2;

    return mod;
};