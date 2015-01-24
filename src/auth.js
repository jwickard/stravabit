'use strict';
var AuthModel = require('./models').AuthModel;
var UserModel = require('./models').UserModel;
var FitBitService = require('./fitbit').FitBitClient;
var StravaClient = require('./strava').StravaClient;
var passport = require('passport');

module.exports = function (session) {
    var module = {};

    module.passport = passport;

    //handle passport user callbacks
    module.passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    module.passport.deserializeUser(function (id, done) {
        UserModel.findOne({_id: id}, function (err, doc) {
            done(err, doc);
        });
    });

    module.passport.use(FitBitService.getOauthStrategy());

    module.passport.use(StravaClient.getOauthStrategy());

    module.ensureAuthenticated = function (res, next) {
        var userId = session.userId;

        //check for all authentications:
        AuthModel.findOne({userId: userId, provider: 'fitbit'}, function (err, auth) {
            if (err) { console.log(err); }

            if (auth) {
                AuthModel.findOne({userId: userId, provider: 'strava'}, function (err, stravauth) {
                    if (err) { console.log(err); }

                    if (stravauth) {
                        return next();
                    }

                    res.redirect('/auth/strava');
                });
            } else {
                res.redirect('/auth/fitbit');
            }
        });
    };

    return module;
};