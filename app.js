var express = require('express');
var session = require('cookie-session')({secret: '1234567890QWERTY'});
var fitBitClient = require('./src/fitbit')(session);
var stravaClient = require('./src/strava')(session);
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var passport = require('passport');
var OauthUtils = require('./lib/Oauth')(session);


//fire up our micro services container
var Services = require('./src/services')(fitBitClient, stravaClient);

app = express();

//setup our middleware

//logging
app.use(morgan('tiny'));

app.use(cookieParser());

app.use(session);

//configure passport oauth middleware
passport.serializeUser(OauthUtils.serializeUser);
passport.deserializeUser(OauthUtils.deserializeUser);
passport.use(OauthUtils.FitBit);
passport.use(OauthUtils.Strava);
app.use(passport.initialize());

app.use(express.static('./public'));

console.log(__dirname);

//include our routes.
require('./src/routes')(app, session, passport, Services);

app.listen(3000);