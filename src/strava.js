StravaStrategy = require('passport-strava').Strategy;
var Promise = require('promise');
var StravaClient = {};
var AuthModel = require('./models').AuthModel;
var UserModel = require('./models').UserModel;

module.exports = function(session){
    StravaClient = {};

    StravaClient._strat = new StravaStrategy({
            consumerKey: process.env.STRAVA_CONSUMER_KEY,
            clientSecret: process.env.STRAVA_CLIENT_SECRET,
            clientID: process.env.STRAVA_CLIENT_ID,
            callbackURL: process.env.STRAVA_CALLBACK
        },
        function(accessToken, refreshToken, params,  profile, done){

            process.nextTick(function(){
                AuthModel.findOne({ oauthId: profile.id}, function(err, doc){
                    if(err){
                        console.log(err);
                    } else {
                        if(doc){
                            UserModel.findOne({_id: doc.userId }, function(err, user){
                                if(err){ return done(err);}

                                if(user){
                                    AuthModel.findOneAndUpdate({ userId: user._id, provider: 'strava'}, { token: accessToken }, function(err, auth){
                                        if(err){ return done(err); }
                                    });

                                    session.userId = user.id;
                                    return done(null, user);
                                } else {
                                    return done(null, false);
                                }
                            });

                        } else {
                            //create!
                            if(session.userId){
                                UserModel.findOne({ _id: session.userId }, function(err, user){
                                    if(err){return done(err);}

                                    if(user){
                                        var authModel = new AuthModel({ oauthId: profile.id, provider: profile.provider, userId: user.id, token: accessToken });

                                        authModel.save(function(err){
                                            if(err){ return done(err); }

                                            session.userId = user.id;

                                            //services.act({cmd: 'syncProfile', 'userId': user._id, type: 'rabbitmq'}, console.log);
                                        });
                                    } else {
                                        return done(null, false);
                                    }
                                });
                            } else {
                                return done(null, false);
                            }
                        }
                    }
                });
            });
        }
    );

    StravaClient.loadActivities = function(token, last){
        if(!last){
            last = (new Date().getTime()-((24*60*60*1000)*2))/1000;
        }

        return new Promise(function(fullfill, reject){
            StravaClient._strat._oauth2.get('https://www.strava.com/api/v3/activities?after='+last, token, function(err, body, res){
                if(err) { reject(err); }

                fullfill(JSON.parse(body));
            });
        });
    };

    StravaClient.getOauthStrategy = function(){
        return this._strat;
    };

    return StravaClient;
}

