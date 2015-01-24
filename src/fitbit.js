'use strict';

var AuthModel = require('./models').AuthModel;
var UserModel = require('./models').UserModel;
var FitbitStrategy = require('passport-fitbit').Strategy;
var Promise = require('promise');

var FitBitService = {};

var activityMap = {'Run': 90009, 'Ride': 90001 };

var _strat = new FitbitStrategy({
        consumerKey: process.env.FITBIT_CONSUMER_KEY,
        consumerSecret: process.env.FITBIT_CONSUMER_SECRET,
        callbackURL: process.env.FITBIT_CALLBACK
    }, function (token, tokenSecret, params, profile, done) {

        process.nextTick(function () {
            AuthModel.findOne({ oauthId: profile.id}, function (err, doc) {
                if (err) { return done(err); }

                if (doc) {
                    //find our user based on existing authentication.
                    UserModel.findOne({_id: doc.userId }, function (err, user) {
                        if (err) {return done(err);}

                        if (user) {
                            AuthModel.findOneAndUpdate({ userId: user._id, provider: 'fitbit'}, {token: token, tokenSecret: tokenSecret}, function (err, auth) {
                                if (err) { return done(err); }
                                console.log('updated token: '+token+' secret: '+tokenSecret);
                            });

                            session.userId = user.id;
                            return done(null, user);
                        } else {
                            return done(null, false);
                        }
                    });
                } else {
                    //create!
                    var user = new UserModel({ name: profile.displayName });

                    user.save(function (err) {
                        if (err) { return done(err); }

                        var authModel = new AuthModel({ oauthId: profile.id, provider: profile.provider, userId: user.id, token: token, tokenSecret: tokenSecret });

                        authModel.save(function (err) {
                            if (err) { return done(err); }

                            session.userId = user.id;

                            //success!
                            return done(null, user);
                        });
                    });
                }
            });
        });
    }
);

//int|id, HH:mm|startTime, long|durationMillis, yyyy-MM-dd:date, X.XX|distance
FitBitService.logActivity = function (auth, activityId, startTime, durationMillis, date, distance, distanceUnit) {
    return new Promise(function (fullfill, reject) {
        var postParams = {
            'activityId': activityId,
            'startTime': startTime,
            'durationMillis': durationMillis,
            'date': date,
            'distance': distance,
            'distanceUnit': distanceUnit
        };

        console.log(postParams);

        _strat._oauth.post('https://api.fitbit.com/1/user/-/activities.json', auth.token, auth.tokenSecret, postParams, function (err, body, res) {
            if (err) { console.log(err); reject(err); }
            fullfill(body);
        });
    });
};

FitBitService.getOauthStrategy = function () {
    return _strat;
};

//sig for our post
//exports.OAuth.prototype.post= function (url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
//    return this._putOrPost("POST", url, oauth_token, oauth_token_secret, post_body, post_content_type, callback);
//}

//    var payload = {
//        'activityId': activityId,
//        'startTime': startTime,
//        'durationMillis': durationMillis,
//        'date': date,
//        'distance': distance,
//        'distanceUnit': distanceUnit
//    };


exports.FitBitClient = FitBitService;