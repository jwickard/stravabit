passport = require('passport');

FitbitStrategy = require('passport-fitbit').Strategy;
StravaStrategy = require('passport-strava').Strategy;

//handle passport user callbacks
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({_id: id}, function(err, doc){
        done(err, doc);
    });
});

passport.use(new FitbitStrategy({
        consumerKey: process.env.FITBIT_CONSUMER_KEY,
        consumerSecret: process.env.FITBIT_CONSUMER_SECRET,
        callbackURL: process.env.FITBIT_CALLBACK
    },
    function(token, tokenSecret, params, profile, done) {
        process.nextTick(function () {
            Auth.findOne({ oauthId: profile.id}, function(err, doc){
                if(err){ return done(err); }

                if(doc){
                    //find our user based on existing authentication.
                    User.findOne({_id: doc.userId }, function(err, user){
                        if(err){return done(err);}

                        if(user){
                            Auth.findOneAndUpdate({ userId: user._id, provider: 'fitbit'}, {token: token, tokenSecret: tokenSecret}, function(err, auth){
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
                    var user = new User({ name: profile.displayName });

                    user.save(function(err){
                        if(err){ return done(err); }

                        var authModel = new Auth({ oauthId: profile.id, provider: profile.provider, userId: user.id, token: token, tokenSecret: tokenSecret });

                        authModel.save(function(err){
                            if(err){ return done(err); }

                            session.userId = user.id;

                            //success!
                            return done(null, user);
                        });
                    });
                }
            });
        });
    }
));

passport.use(new StravaStrategy({
        consumerKey: process.env.STRAVA_CONSUMER_KEY,
        clientSecret: process.env.STRAVA_CLIENT_SECRET,
        clientID: process.env.STRAVA_CLIENT_ID,
        callbackURL: process.env.STRAVA_CALLBACK
    },
    function(accessToken, refreshToken, params,  profile, done){
        console.log('accessToken');
        console.log(accessToken);

        console.log('params');
        console.log(params);

        process.nextTick(function(){
            Auth.findOne({ oauthId: profile.id}, function(err, doc){
                if(err){
                    console.log(err);
                } else {
                    if(doc){
                        User.findOne({_id: doc.userId }, function(err, user){
                            if(err){ return done(err);}

                            if(user){
                                Auth.findOneAndUpdate({ userId: user._id, provider: 'strava'}, { token: accessToken }, function(err, auth){
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
                            User.findOne({ _id: session.userId }, function(err, user){
                                if(err){return done(err);}

                                if(user){
                                    var authModel = new Auth({ oauthId: profile.id, provider: profile.provider, userId: user.id, token: accessToken });

                                    authModel.save(function(err){
                                        if(err){ return done(err); }

                                        session.userId = user.id;

                                        return done(null, user);
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
));

ensureAuthenticated = function(req, res, next) {
    var userId = session.userId;

    //check for all authentications:
    Auth.findOne({userId: userId, provider: 'fitbit'}, function(err, auth){
        if(auth){
            Auth.findOne({userId: userId, provider: 'strava'}, function(err, stravauth){
                if(stravauth){
                    return next();
                } else {
                    res.redirect('/auth/strava');
                }
            });
        } else {
            res.redirect('/auth/fitbit');
        }
    });
}