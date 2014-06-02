passport = require('passport');
FitbitStrategy = require('passport-fitbit').Strategy;
StravaStrategy = require('passport-strava').Strategy;

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