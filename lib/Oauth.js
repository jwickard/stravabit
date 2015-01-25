var UserModel = require('../src/models').UserModel;
var AuthModel = require('../src/models').AuthModel;
var FitbitStrategy = require('passport-fitbit').Strategy;
var StravaStrategy = require('passport-strava').Strategy;
var P = require('promise');

module.exports = function(session) {
    var Oauth = {};

    //handle passport user callbacks
    Oauth.serializeUser = function (user, done) {
        done(null, user.id);
    };

    Oauth.deserializeUser = function (id, done) {
        UserModel.findOne({_id: id}, function (err, doc) {
            done(err, doc);
        });
    };

    var handleOauthCallback = function(profile, token, tokenSecret) {

        return new P(function (fullfill, reject) {
            AuthModel.findOne( { oauthId: profile.id }, function (err, auth) {
                if (err) { reject(err); }

                if (auth) {
                    //find out user based on existing authentication
                    UserModel.findOne({ _id: auth.userId }, function (err, user){
                        if (err) { reject(err); }

                        if (user) {
                            auth.token = token;
                            auth.tokenSecret = tokenSecret;

                            auth.save( function (err) {
                                if (err) { reject(err); }

                                fullfill(user);
                            });
                        }
                    });
                } else {
                    //create!
                    var user = new UserModel({name: profile.displayName});

                    user.save(function (err) {
                        if (err) { reject(err); }

                        var authModel = new AuthModel({
                            oauthId: profile.id,
                            provider: profile.provider,
                            userId: user.id,
                            token: token,
                            tokenSecret: tokenSecret
                        });

                        authModel.save(function (err) {
                            if (err) { reject(err); }

                            fullfill(user);
                        });
                    });
                }
            } )
        });
    };

    Oauth.FitBit = new FitbitStrategy({
        consumerKey: process.env.FITBIT_CONSUMER_KEY,
        consumerSecret: process.env.FITBIT_CONSUMER_SECRET,
        callbackURL: process.env.FITBIT_CALLBACK
    }, function (token, tokenSecret, params, profile, done) {

        process.nextTick(function () {
            handleOauthCallback(profile, token, tokenSecret).then(
                function (user) {
                    session.userId = user.id;
                    done(null, user);
                },
                function(err) {
                    done(err, null);
                }
            );
        });
    });

    Oauth.fitBitOauth = Oauth.FitBit._oauth;

    Oauth.Strava =  new StravaStrategy({
            consumerKey: process.env.STRAVA_CONSUMER_KEY,
            clientSecret: process.env.STRAVA_CLIENT_SECRET,
            clientID: process.env.STRAVA_CLIENT_ID,
            callbackURL: process.env.STRAVA_CALLBACK
        }, function(accessToken, refreshToken, params,  profile, done){

            process.nextTick( function() {
                handleOauthCallback(profile, accessToken, null).then(
                    function (user) {
                        session.userId = user.id;
                        done(null, user);
                    },
                    function(err) {
                        done(err, null);
                    }
                );
            });
        }
    );

    Oauth.stravaOauth = Oauth.Strava._oauth2;

    //module.ensureAuthenticated = function (res, next) {
    //    var userId = session.userId;
    //
    //    //check for all authentications:
    //    AuthModel.findOne({userId: userId, provider: 'fitbit'}, function (err, auth) {
    //        if (err) { console.log(err); }
    //
    //        if (auth) {
    //            AuthModel.findOne({userId: userId, provider: 'strava'}, function (err, stravauth) {
    //                if (err) { console.log(err); }
    //
    //                if (stravauth) {
    //                    return next();
    //                }
    //
    //                res.redirect('/auth/strava');
    //            });
    //        } else {
    //            res.redirect('/auth/fitbit');
    //        }
    //    });
    //};

    return Oauth;
}


