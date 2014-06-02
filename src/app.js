passport = require('passport');
var FitbitStrategy = require('passport-fitbit').Strategy;
var StravaStrategy = require('passport-strava').Strategy;
var express = require('express');
var session = require('cookie-session');
var cookieParser = require('cookie-parser');

//include our model layer
require('./../models');

//handle passport user callbacks
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new FitbitStrategy({
        consumerKey: process.env.FITBIT_CONSUMER_KEY,
        consumerSecret: process.env.FITBIT_CONSUMER_SECRET,
        callbackURL: process.env.FITBIT_CALLBACK
    },
    function(token, tokenSecret, profile, done) {
        process.nextTick(function () {
            console.log(profile);
            // To keep the example simple, the user's Fitbit profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Fitbit account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
));

passport.use(new StravaStrategy({
        consumerKey: process.env.STRAVA_CONSUMER_KEY,
        clientSecret: process.env.STRAVA_CLIENT_SECRET,
        clientID: process.env.STRAVA_CLIENT_ID,
        callbackURL: process.env.STRAVA_CALLBACK
    },
    function(token, tokenSecret, profile, done){
        process.nextTick(function(){
            console.log(profile);

            return done(null, profile);
        });
    }
));

app = express();


//app.use(express.logger());
app.use(passport.initialize());
app.use(cookieParser());
app.use(session({secret: '1234567890QWERTY'}));

//include our routes.
require('./../routes');

app.listen(8080);